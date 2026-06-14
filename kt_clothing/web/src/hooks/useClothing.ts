// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KT_CLOTHING — useClothing hook
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { useEffect, useState } from "react"
import { useClothingStore } from "../store/clothing.store"
import { onOpen, onClose, closeUI, buyClothing } from "../bridge"

export function useClothing() {
    const [visible,   setVisible]   = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const store = useClothingStore()

    useEffect(() => {
        const offOpen = onOpen((data) => {
            setVisible(true)
            setSubmitting(false)
            if (data.currentClothing) {
                const c = data.currentClothing as { components?: Record<number, unknown>; props?: Record<number, unknown> }
                store.setOriginal(
                    (c.components ?? {}) as Parameters<typeof store.setOriginal>[0],
                    (c.props      ?? {}) as Parameters<typeof store.setOriginal>[1]
                )
            }
        })

        const offClose = onClose(() => {
            setVisible(false)
            store.reset()
        })

        return () => { offOpen(); offClose() }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // Echap
    useEffect(() => {
        if (!visible) return
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") void handleCancel()
        }
        window.addEventListener("keydown", handler)
        return () => window.removeEventListener("keydown", handler)
    }, [visible]) // eslint-disable-line react-hooks/exhaustive-deps

    const handleBuy = async () => {
        setSubmitting(true)
        await buyClothing(store.components, store.props)
        setSubmitting(false)
    }

    const handleCancel = async () => {
        store.revertToOriginal()
        await closeUI()
    }

    return {
        visible,
        submitting,
        store,
        handleBuy,
        handleCancel,
    }
}
