// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KT_BARBER — BRIDGE NUI
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const RESOURCE = (window as any).GetParentResourceName?.() ?? "kt_barber"

async function send(endpoint: string, data?: unknown): Promise<boolean> {
  try {
    const res = await fetch(`https://${RESOURCE}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data ?? {}),
    })
    return res.ok
  } catch { return false }
}

function on<T = unknown>(type: string, handler: (data: T) => void): () => void {
  const listener = (e: MessageEvent) => {
    if (e.data?.type === type) handler(e.data as T)
  }
  window.addEventListener("message", listener)
  return () => window.removeEventListener("message", listener)
}

export interface HairData {
  style: number
  color: number
  highlight: number
}

// Preview coiffure en temps réel
export async function previewHair(hair: HairData) {
  return send("preview:hair", hair)
}

// Sauvegarde
export async function saveHair(hair: HairData) {
  return send("barber:save", { hair })
}

export async function cameraAction(action: string) {
  return send("cameraControl", { action })
}

export async function closeUI() {
  return send("close")
}

export function onOpen(cb: (data: { currentHair?: HairData }) => void) {
  return on("open", cb)
}

export function onClose(cb: () => void) {
  return on<unknown>("close", () => cb())
}
