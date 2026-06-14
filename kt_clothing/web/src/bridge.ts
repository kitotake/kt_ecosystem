// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KT_CLOTHING — BRIDGE NUI
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const RESOURCE = (window as any).GetParentResourceName?.() ?? "kt_clothing"

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

// Preview vêtement en temps réel
export async function previewClothing(components: unknown, props: unknown) {
  return send("preview:clothing", { components, props })
}

// Achat / confirmation
export async function buyClothing(components: unknown, props: unknown) {
  return send("clothing:buy", { components, props })
}

export async function cameraAction(action: string) {
  return send("cameraControl", { action })
}

export async function closeUI() {
  return send("close")
}

export function onOpen(cb: (data: { currentClothing?: unknown }) => void) {
  return on("open", cb)
}

export function onClose(cb: () => void) {
  return on<unknown>("close", () => cb())
}
