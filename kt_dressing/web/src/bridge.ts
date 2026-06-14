// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KT_DRESSING — BRIDGE NUI
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const RESOURCE = (window as any).GetParentResourceName?.() ?? "kt_dressing"

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

export interface Outfit {
  id: number
  name: string
  components: Record<number, unknown>
  props: Record<number, unknown>
}

// Preview tenue
export async function previewOutfit(outfit: Outfit) {
  return send("outfit:preview", outfit)
}

// Porter la tenue
export async function wearOutfit(outfit: Outfit) {
  return send("outfit:wear", outfit)
}

// Sauvegarder tenue actuelle
export async function saveOutfit(name: string, components: unknown, props: unknown) {
  return send("outfit:save", { name, components, props })
}

// Supprimer une tenue
export async function deleteOutfit(outfit_id: number) {
  return send("outfit:delete", { outfit_id })
}

export async function cameraAction(action: string) {
  return send("cameraControl", { action })
}

export async function closeUI() {
  return send("close")
}

export function onOpen(cb: () => void) {
  return on("open", cb)
}

export function onClose(cb: () => void) {
  return on<unknown>("close", () => cb())
}

export function onOutfitsList(cb: (outfits: Outfit[]) => void) {
  return on<{ outfits: Outfit[] }>("outfitsList", (d) => cb(d.outfits))
}

export function onOutfitSaved(cb: (outfit: Outfit) => void) {
  return on<{ outfit: Outfit }>("outfitSaved", (d) => cb(d.outfit))
}

export function onOutfitDeleted(cb: (id: number) => void) {
  return on<{ id: number }>("outfitDeleted", (d) => cb(d.id))
}
