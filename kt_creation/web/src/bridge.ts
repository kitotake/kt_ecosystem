// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KT_CREATION — BRIDGE NUI
// Unique point de communication entre le React et le Lua de kt_creation.
// Le Lua de kt_creation proxie ensuite vers kt_character.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const RESOURCE = (window as any).GetParentResourceName?.() ?? "kt_creation"

// ── SEND ──────────────────────────────────────────────────────────────────

async function send(endpoint: string, data?: unknown): Promise<boolean> {
    try {
        const res = await fetch(`https://${RESOURCE}/${endpoint}`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify(data ?? {}),
        })
        return res.ok
    } catch {
        return false
    }
}

// ── LISTEN ────────────────────────────────────────────────────────────────

function on<T = unknown>(type: string, handler: (data: T) => void): () => void {
    const listener = (event: MessageEvent) => {
        const msg = event.data
        if (msg?.type === type || msg?.action === type) {
            handler(msg as T)
        }
    }
    window.addEventListener("message", listener)
    return () => window.removeEventListener("message", listener)
}

// ── PREVIEW ───────────────────────────────────────────────────────────────

export async function previewUpdate(data: Record<string, unknown>) {
    return send("preview:update", data)
}

export async function previewApplyClothing(
    components: Record<number, unknown>,
    props: Record<number, unknown>
) {
    return send("preview:applyClothing", { components, props })
}

export async function cameraAction(action: string) {
    return send("cameraControl", { action })
}

export async function tabChange(tab: string) {
    return send("tabChange", { tab })
}

// ── CRÉATION ──────────────────────────────────────────────────────────────

export async function createCharacter(data: unknown) {
    return send("character:create", data)
}

// ── FERMETURE ─────────────────────────────────────────────────────────────

export async function closeUI() {
    return send("close")
}

// ── LISTENERS ─────────────────────────────────────────────────────────────

export function onOpen(cb: (data: { skinData?: unknown }) => void) {
    return on("open", cb)
}

export function onClose(cb: () => void) {
    return on<unknown>("close", () => cb())
}

export function onSetIdentifier(cb: (data: { identifier: string; unique_id: string }) => void) {
    return on("setIdentifier", cb)
}

export function onError(cb: (data: { message: string }) => void) {
    return on("error", cb)
}
