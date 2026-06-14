// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KT_DRESSING — useDressing hook
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { useEffect, useState } from "react"
import { useDressingStore } from "../store/dressing.store"
import {
    onOpen, onClose, onOutfitsList, onOutfitSaved, onOutfitDeleted,
    closeUI, wearOutfit, saveOutfit, deleteOutfit,
    type Outfit,
} from "../bridge"

export function useDressing() {
    const [visible,    setVisible]    = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const store = useDressingStore()

    useEffect(() => {
        const offOpen    = onOpen(() => { setVisible(true); setSubmitting(false) })
        const offClose   = onClose(() => { setVisible(false); store.reset() })
        const offList    = onOutfitsList((outfits) => store.setOutfits(outfits))
        const offSaved   = onOutfitSaved((outfit)  => store.addOutfit(outfit))
        const offDeleted = onOutfitDeleted((id)    => store.removeOutfit(id))

        return () => { offOpen(); offClose(); offList(); offSaved(); offDeleted() }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!visible) return
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") void handleClose()
        }
        window.addEventListener("keydown", handler)
        return () => window.removeEventListener("keydown", handler)
    }, [visible]) // eslint-disable-line react-hooks/exhaustive-deps

    const handleWear = async (outfit: Outfit) => {
        await wearOutfit(outfit)
    }

    const handleSave = async (components: unknown, props: unknown) => {
        const name = store.saveNameInput.trim()
        if (!name) return
        setSubmitting(true)
        await saveOutfit(name, components, props)
        store.setSaveNameInput("")
        setSubmitting(false)
    }

    const handleDelete = async (id: number) => {
        await deleteOutfit(id)
    }

    const handleClose = async () => {
        await closeUI()
    }

    return {
        visible,
        submitting,
        store,
        handleWear,
        handleSave,
        handleDelete,
        handleClose,
    }
}
