// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KT_DRESSING — DRESSING STORE (Zustand)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { create } from "zustand"
import { previewOutfit, type Outfit } from "../bridge"

interface DressingStore {
    outfits:        Outfit[]
    selectedOutfit: Outfit | null
    saveNameInput:  string

    setOutfits:       (outfits: Outfit[])     => void
    addOutfit:        (outfit: Outfit)         => void
    removeOutfit:     (id: number)             => void
    selectOutfit:     (outfit: Outfit | null)  => void
    setSaveNameInput: (name: string)           => void
    reset:            ()                       => void
}

export const useDressingStore = create<DressingStore>((set, get) => ({
    outfits:        [],
    selectedOutfit: null,
    saveNameInput:  "",

    setOutfits: (outfits) => set({ outfits }),

    addOutfit: (outfit) =>
        set({ outfits: [...get().outfits, outfit] }),

    removeOutfit: (id) =>
        set({ outfits: get().outfits.filter((o) => o.id !== id) }),

    selectOutfit: (outfit) => {
        set({ selectedOutfit: outfit })
        if (outfit) previewOutfit(outfit)
    },

    setSaveNameInput: (name) => set({ saveNameInput: name }),

    reset: () => set({
        outfits:        [],
        selectedOutfit: null,
        saveNameInput:  "",
    }),
}))
