// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KT_CREATION — useCreator hook
// Orchestre wizard + stores + bridge.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { useState, useCallback, useEffect } from "react"
import { useIdentityStore }   from "../store/identity.store"
import { useAppearanceStore } from "../store/appearance.store"
import { closeUI, createCharacter, onOpen, onClose, onError, onSetIdentifier } from "../bridge"

export const STEPS = [
    { id: "identity",   label: "Identité",  icon: "👤" },
    { id: "appearance", label: "Apparence", icon: "✦"  },
    { id: "style",      label: "Style",     icon: "✂️"  },
    { id: "clothing",   label: "Tenue",     icon: "👔"  },
] as const

export type StepId = typeof STEPS[number]["id"]

export function useCreator() {
    const [visible,     setVisible]     = useState(false)
    const [stepIndex,   setStepIndex]   = useState(0)
    const [submitting,  setSubmitting]  = useState(false)
    const [serverError, setServerError] = useState("")

    const identity   = useIdentityStore()
    const appearance = useAppearanceStore()

    // ── NUI messages ────────────────────────────────────────────────────

    useEffect(() => {
        const offOpen  = onOpen((data) => {
            setVisible(true)
            setStepIndex(0)
            setServerError("")
            setSubmitting(false)
            if (data.skinData) {
                appearance.hydrate(data.skinData as Parameters<typeof appearance.hydrate>[0])
            }
        })

        const offClose = onClose(() => {
            setVisible(false)
            setSubmitting(false)
            identity.reset()
            appearance.reset()
        })

        const offError = onError((data) => {
            setServerError(data.message)
            setSubmitting(false)
        })

        const offId = onSetIdentifier((data) => {
            identity.setIdentifier(data.identifier, data.unique_id)
        })

        return () => { offOpen(); offClose(); offError(); offId() }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // ── Echap ────────────────────────────────────────────────────────────

    useEffect(() => {
        if (!visible) return
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") { e.preventDefault(); void handleClose() }
        }
        window.addEventListener("keydown", handler)
        return () => window.removeEventListener("keydown", handler)
    }, [visible]) // eslint-disable-line react-hooks/exhaustive-deps

    // ── Navigation ───────────────────────────────────────────────────────

    const goToStep = useCallback((index: number) => {
        setStepIndex(Math.max(0, Math.min(STEPS.length - 1, index)))
    }, [])

    const nextStep = useCallback(() => {
        if (stepIndex === 0 && !identity.validate()) return
        if (stepIndex < STEPS.length - 1) goToStep(stepIndex + 1)
    }, [stepIndex, identity, goToStep])

    const prevStep = useCallback(() => {
        if (stepIndex > 0) goToStep(stepIndex - 1)
    }, [stepIndex, goToStep])

    // ── Submit ────────────────────────────────────────────────────────────

    const handleSubmit = useCallback(async () => {
        if (!identity.validate()) { goToStep(0); return }
        setSubmitting(true)
        setServerError("")

        const payload = {
            ...identity.data,
            ...appearance.getPayload(),
        }

        const ok = await createCharacter(payload)
        if (!ok) {
            setServerError("Erreur lors de la création. Veuillez réessayer.")
            setSubmitting(false)
        }
        // Si ok, le serveur répond avec kt_creation:created → onClose sera déclenché
    }, [identity, appearance, goToStep])

    // ── Close ─────────────────────────────────────────────────────────────

    const handleClose = useCallback(async () => {
        setSubmitting(false)
        setServerError("")
        identity.reset()
        appearance.reset()
        await closeUI()
        setVisible(false)
    }, [identity, appearance])

    return {
        visible,
        stepIndex,
        submitting,
        serverError,
        isLastStep:  stepIndex === STEPS.length - 1,
        currentStep: STEPS[stepIndex],

        goToStep,
        nextStep,
        prevStep,
        handleSubmit,
        handleClose,
    }
}
