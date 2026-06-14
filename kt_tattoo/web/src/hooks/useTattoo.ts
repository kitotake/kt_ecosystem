// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KT_TATTOO — useTattoo hook
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { useEffect, useState } from "react"
import { useTattooStore, type TattooZone } from "../store/tattoo.store"
import { onOpen, onClose, closeUI, saveTattoos, type Tattoo } from "../bridge"

export function useTattoo() {
    const [visible,    setVisible]    = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const store = useTattooStore()

    useEffect(() => {
        const offOpen = onOpen((data) => {
            setVisible(true)
            setSubmitting(false)
            if (data.currentTattoos) {
                store.setOriginal(data.currentTattoos as Tattoo[])
            }
        })

        const offClose = onClose(() => {
            setVisible(false)
            store.reset()
        })

        return () => { offOpen(); offClose() }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!visible) return
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") void handleCancel()
        }
        window.addEventListener("keydown", handler)
        return () => window.removeEventListener("keydown", handler)
    }, [visible]) // eslint-disable-line react-hooks/exhaustive-deps

    const handleSave = async () => {
        setSubmitting(true)
        await saveTattoos(store.applied)
        setSubmitting(false)
    }

    const handleCancel = async () => {
        store.revertToOriginal()
        await closeUI()
    }

    const zoneCount = (zone: TattooZone) =>
        store.applied.filter((t) => t.zone === zone).length

    return {
        visible,
        submitting,
        store,
        zoneCount,
        handleSave,
        handleCancel,
    }
}
