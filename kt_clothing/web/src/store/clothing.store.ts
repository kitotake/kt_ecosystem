// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KT_CLOTHING — CLOTHING STORE (Zustand)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { create } from "zustand"
import { previewClothing } from "../bridge"

export interface ClothingComponent {
    drawable: number
    texture:  number
    palette:  number
}

export interface Prop {
    propIndex:        number
    propTextureIndex: number
}

export type Components = Record<number, ClothingComponent>
export type Props       = Record<number, Prop>

interface ClothingStore {
    components:     Components
    props:          Props
    originalComp:   Components
    originalProps:  Props
    activeCategory: number | null

    setComponents:     (data: Components) => void
    setProps:          (data: Props)      => void
    setActiveCategory: (id: number | null) => void
    updateComponent:   (id: number, patch: Partial<ClothingComponent>) => void
    updateProp:        (anchor: number, patch: Partial<Prop>)          => void
    setOriginal:       (comp: Components, props: Props) => void
    revertToOriginal:  () => void
    reset:             () => void
}

export const useClothingStore = create<ClothingStore>((set, get) => ({
    components:     {},
    props:          {},
    originalComp:   {},
    originalProps:  {},
    activeCategory: null,

    setComponents: (data) => {
        set({ components: data })
        previewClothing(data, get().props)
    },

    setProps: (data) => {
        set({ props: data })
        previewClothing(get().components, data)
    },

    setActiveCategory: (id) => set({ activeCategory: id }),

    updateComponent: (id, patch) => {
        const components = {
            ...get().components,
            [id]: { ...get().components[id], ...patch },
        }
        set({ components })
        previewClothing(components, get().props)
    },

    updateProp: (anchor, patch) => {
        const props = {
            ...get().props,
            [anchor]: { ...get().props[anchor], ...patch },
        }
        set({ props })
        previewClothing(get().components, props)
    },

    setOriginal: (comp, props) =>
        set({ originalComp: comp, originalProps: props }),

    revertToOriginal: () => {
        const { originalComp, originalProps } = get()
        set({ components: originalComp, props: originalProps })
        previewClothing(originalComp, originalProps)
    },

    reset: () => set({
        components: {}, props: {},
        originalComp: {}, originalProps: {},
        activeCategory: null,
    }),
}))
