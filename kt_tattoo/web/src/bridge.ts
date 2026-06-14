// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KT_TATTOO — BRIDGE NUI
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const RESOURCE = (window as any).GetParentResourceName?.() ?? "kt_tattoo"

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

export interface Tattoo {
  id: string
  zone: string
  collection: string
  overlay: string
  label: string
}

// Preview tatouages en temps réel
export async function previewTattoos(tattoos: Tattoo[]) {
  return send("preview:tattoos", { tattoos })
}

// Sauvegarde
export async function saveTattoos(tattoos: Tattoo[]) {
  return send("tattoo:save", { tattoos })
}

export async function cameraAction(action: string) {
  return send("cameraControl", { action })
}

export async function closeUI() {
  return send("close")
}

export function onOpen(cb: (data: { currentTattoos?: Tattoo[] }) => void) {
  return on("open", cb)
}

export function onClose(cb: () => void) {
  return on<unknown>("close", () => cb())
}
