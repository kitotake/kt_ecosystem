// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KT_TATTOO — TATTOO STORE (Zustand)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { create } from "zustand"
import { previewTattoos, type Tattoo } from "../bridge"

export type TattooZone = "head" | "torso" | "left_arm" | "right_arm" | "left_leg" | "right_leg"

interface TattooStore {
    applied:    Tattoo[]
    original:   Tattoo[]
    activeZone: TattooZone

    setActiveZone:    (zone: TattooZone)  => void
    toggleTattoo:     (tattoo: Tattoo)    => void
    clearZone:        (zone: TattooZone)  => void
    setOriginal:      (tattoos: Tattoo[]) => void
    revertToOriginal: ()                  => void
    reset:            ()                  => void
}

export const useTattooStore = create<TattooStore>((set, get) => ({
    applied:    [],
    original:   [],
    activeZone: "torso",

    setActiveZone: (zone) => set({ activeZone: zone }),

    toggleTattoo: (tattoo) => {
        const applied = get().applied
        const exists  = applied.some((t) => t.id === tattoo.id)
        const next    = exists
            ? applied.filter((t) => t.id !== tattoo.id)
            : [...applied, tattoo]
        set({ applied: next })
        previewTattoos(next)
    },

    clearZone: (zone) => {
        const next = get().applied.filter((t) => t.zone !== zone)
        set({ applied: next })
        previewTattoos(next)
    },

    setOriginal: (tattoos) => set({
        original: [...tattoos],
        applied:  [...tattoos],
    }),

    revertToOriginal: () => {
        const { original } = get()
        set({ applied: [...original] })
        previewTattoos(original)
    },

    reset: () => set({
        applied:    [],
        original:   [],
        activeZone: "torso",
    }),
}))
