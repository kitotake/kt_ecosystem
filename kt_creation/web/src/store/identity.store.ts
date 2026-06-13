// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KT_CREATION — IDENTITY STORE (Zustand)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { create } from "zustand"

export type GenderModel = "mp_m_freemode_01" | "mp_f_freemode_01"

export interface IdentityData {
    identifier:  string
    unique_id:   string
    firstname:   string
    lastname:    string
    dateofbirth: string
    gender:      GenderModel
}

interface IdentityErrors {
    firstname?:   string
    lastname?:    string
    dateofbirth?: string
}

interface IdentityStore {
    data:   IdentityData
    errors: IdentityErrors

    setField:      (key: keyof IdentityData, value: string) => void
    setIdentifier: (identifier: string, unique_id: string) => void
    validate:      () => boolean
    reset:         () => void
    getAge:        () => number | null
}

const DEFAULT: IdentityData = {
    identifier:  "",
    unique_id:   "",
    firstname:   "",
    lastname:    "",
    dateofbirth: "",
    gender:      "mp_m_freemode_01",
}

export const useIdentityStore = create<IdentityStore>((set, get) => ({
    data:   { ...DEFAULT },
    errors: {},

    setField: (key, value) =>
        set((s) => ({
            data:   { ...s.data,   [key]: value },
            errors: { ...s.errors, [key]: undefined },
        })),

    setIdentifier: (identifier, unique_id) =>
        set((s) => ({
            data: { ...s.data, identifier, unique_id },
        })),

    validate: () => {
        const { data } = get()
        const errors: IdentityErrors = {}

        if (!data.firstname.trim() || data.firstname.trim().length < 2)
            errors.firstname = "Prénom invalide (2 caractères minimum)"

        if (!data.lastname.trim() || data.lastname.trim().length < 2)
            errors.lastname = "Nom invalide (2 caractères minimum)"

        if (!data.dateofbirth) {
            errors.dateofbirth = "Date de naissance requise"
        } else {
            const age = new Date().getFullYear() - new Date(data.dateofbirth).getFullYear()
            if (age < 18)  errors.dateofbirth = "18 ans minimum requis"
            if (age > 100) errors.dateofbirth = "Date invalide"
        }

        set({ errors })
        return Object.keys(errors).length === 0
    },

    reset: () => set({ data: { ...DEFAULT }, errors: {} }),

    getAge: () => {
        const { data } = get()
        if (!data.dateofbirth) return null
        const age = new Date().getFullYear() - new Date(data.dateofbirth).getFullYear()
        return isNaN(age) ? null : age
    },
}))
