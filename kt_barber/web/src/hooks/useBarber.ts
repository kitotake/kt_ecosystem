// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KT_BARBER — useBarber hook
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { useEffect, useState } from "react"
import { useBarberStore } from "../store/barber.store"
import { onOpen, onClose, closeUI, saveHair, type HairData } from "../bridge"

export function useBarber() {
    const [visible,    setVisible]    = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const store = useBarberStore()

    useEffect(() => {
        const offOpen = onOpen((data) => {
            setVisible(true)
            setSubmitting(false)
            if (data.currentHair) {
                store.setOriginal(data.currentHair as HairData)
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
        await saveHair(store.hair)
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
        handleSave,
        handleCancel,
    }
}
