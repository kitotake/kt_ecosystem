// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KT_CREATION — APPEARANCE STORE (Zustand)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { create } from "zustand"
import { previewUpdate } from "../bridge"

// ── Types ─────────────────────────────────────────────────────────────────

export interface HeadBlend {
    shapeFirst: number; shapeSecond: number; shapeMix: number
    skinFirst:  number; skinSecond:  number; skinMix:  number
}

export type FaceFeatures = number[]

export interface HeadOverlay {
    index: number; opacity: number; firstColor: number; secondColor: number
}

export type HeadOverlays = Record<number, HeadOverlay>

export interface HairData {
    style: number; color: number; highlight: number
}

export type ClothingComponents = Record<number, { drawable: number; texture: number; palette: number }>
export type Props              = Record<number, { propIndex: number; propTextureIndex: number }>

export interface Tattoo {
    id: string; zone: string; collection: string; overlay: string; label: string
}

// ── Defaults ─────────────────────────────────────────────────────────────

const DEFAULT_HEAD_BLEND: HeadBlend = {
    shapeFirst: 0, shapeSecond: 0, shapeMix: 0.5,
    skinFirst:  0, skinSecond:  0, skinMix:  0.5,
}

const DEFAULT_OVERLAYS: HeadOverlays = Object.fromEntries(
    Array.from({ length: 13 }, (_, i) => [i, { index: 0, opacity: 1.0, firstColor: 0, secondColor: 0 }])
)

// ── Store ─────────────────────────────────────────────────────────────────

interface AppearanceStore {
    headBlend:    HeadBlend
    faceFeatures: FaceFeatures
    headOverlays: HeadOverlays
    hair:         HairData
    components:   ClothingComponents
    props:        Props
    tattoos:      Tattoo[]

    setHeadBlend:    (data: HeadBlend)       => void
    setFaceFeatures: (data: FaceFeatures)    => void
    setHeadOverlays: (data: HeadOverlays)    => void
    setHair:         (patch: Partial<HairData>) => void
    setComponents:   (data: ClothingComponents) => void
    setProps:        (data: Props)           => void
    setTattoos:      (data: Tattoo[])        => void

    hydrate: (skinData: Partial<AppearanceStore>) => void
    reset:   () => void
    getPayload: () => Omit<AppearanceStore,
        "setHeadBlend"|"setFaceFeatures"|"setHeadOverlays"|"setHair"|
        "setComponents"|"setProps"|"setTattoos"|"hydrate"|"reset"|"getPayload">
}

export const useAppearanceStore = create<AppearanceStore>((set, get) => ({
    headBlend:    { ...DEFAULT_HEAD_BLEND },
    faceFeatures: new Array(20).fill(0.0),
    headOverlays: { ...DEFAULT_OVERLAYS },
    hair:         { style: 0, color: 0, highlight: 0 },
    components:   {},
    props:        {},
    tattoos:      [],

    setHeadBlend: (data) => {
        set({ headBlend: data })
        previewUpdate({ headBlend: data })
    },

    setFaceFeatures: (data) => {
        set({ faceFeatures: data })
        previewUpdate({ faceFeatures: data })
    },

    setHeadOverlays: (data) => {
        set({ headOverlays: data })
        previewUpdate({ headOverlays: data })
    },

    setHair: (patch) => {
        const hair = { ...get().hair, ...patch }
        set({ hair })
        previewUpdate({ hair })
    },

    setComponents: (data) => {
        set({ components: data })
        previewUpdate({ components: data })
    },

    setProps: (data) => {
        set({ props: data })
        previewUpdate({ props: data })
    },

    setTattoos: (data) => {
        set({ tattoos: data })
        previewUpdate({ tattoos: data })
    },

    hydrate: (skinData) => {
        set({
            headBlend:    skinData.headBlend    ?? { ...DEFAULT_HEAD_BLEND },
            faceFeatures: skinData.faceFeatures ?? new Array(20).fill(0.0),
            headOverlays: skinData.headOverlays ?? { ...DEFAULT_OVERLAYS },
            hair:         skinData.hair         ?? { style: 0, color: 0, highlight: 0 },
            components:   skinData.components   ?? {},
            props:        skinData.props        ?? {},
            tattoos:      skinData.tattoos      ?? [],
        })
    },

    reset: () => set({
        headBlend:    { ...DEFAULT_HEAD_BLEND },
        faceFeatures: new Array(20).fill(0.0),
        headOverlays: { ...DEFAULT_OVERLAYS },
        hair:         { style: 0, color: 0, highlight: 0 },
        components:   {},
        props:        {},
        tattoos:      [],
    }),

    getPayload: () => {
        const { headBlend, faceFeatures, headOverlays, hair, components, props, tattoos } = get()
        return { headBlend, faceFeatures, headOverlays, hair, components, props, tattoos }
    },
}))
