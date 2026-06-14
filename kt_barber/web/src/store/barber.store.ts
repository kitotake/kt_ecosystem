// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KT_BARBER — BARBER STORE (Zustand)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { create } from "zustand"
import { previewHair, type HairData } from "../bridge"

interface BarberStore {
    hair:         HairData
    originalHair: HairData

    setHair:          (patch: Partial<HairData>) => void
    setOriginal:      (hair: HairData)           => void
    revertToOriginal: ()                         => void
    reset:            ()                         => void
}

const DEFAULT_HAIR: HairData = { style: 0, color: 0, highlight: 0 }

export const useBarberStore = create<BarberStore>((set, get) => ({
    hair:         { ...DEFAULT_HAIR },
    originalHair: { ...DEFAULT_HAIR },

    setHair: (patch) => {
        const hair = { ...get().hair, ...patch }
        set({ hair })
        previewHair(hair)
    },

    setOriginal: (hair) => set({
        originalHair: { ...hair },
        hair:         { ...hair },
    }),

    revertToOriginal: () => {
        const { originalHair } = get()
        set({ hair: { ...originalHair } })
        previewHair(originalHair)
    },

    reset: () => set({
        hair:         { ...DEFAULT_HAIR },
        originalHair: { ...DEFAULT_HAIR },
    }),
}))
