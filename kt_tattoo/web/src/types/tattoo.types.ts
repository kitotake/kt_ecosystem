// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KT_TATTOO — TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { TattooZone } from "../store/tattoo.store"

export const ZONE_LABELS: Record<TattooZone, string> = {
    head:      "Tête",
    torso:     "Torse",
    left_arm:  "Bras gauche",
    right_arm: "Bras droit",
    left_leg:  "Jambe gauche",
    right_leg: "Jambe droite",
}

export const ZONE_ICONS: Record<TattooZone, string> = {
    head:      "💀",
    torso:     "🫀",
    left_arm:  "💪",
    right_arm: "💪",
    left_leg:  "🦵",
    right_leg: "🦵",
}

export const ZONES: TattooZone[] = [
    "head", "torso", "left_arm", "right_arm", "left_leg", "right_leg",
]

// Catalogue de base — à étendre selon les DLC
export const TATTOO_CATALOG = [
    // HEAD
    { id: "head_01", zone: "head" as TattooZone, label: "Crâne Tribal",    collection: "mpbeach_overlays",   overlay: "FM_Bea_M_Tattoo_Head_000_M" },
    { id: "head_02", zone: "head" as TattooZone, label: "Toile Araignée",  collection: "mphipster_overlays", overlay: "FM_Hip_M_Tattoo_Head_000_M" },
    { id: "head_03", zone: "head" as TattooZone, label: "Flammes Crâne",   collection: "mplowrider_overlays",overlay: "FM_Lor_M_Tattoo_Head_000_M" },
    // TORSO
    { id: "torso_01", zone: "torso" as TattooZone, label: "Ailes d'Ange",  collection: "mpbeach_overlays",   overlay: "FM_Bea_M_Tattoo_Torso_000_M" },
    { id: "torso_02", zone: "torso" as TattooZone, label: "Croix Gothic",  collection: "mphipster_overlays", overlay: "FM_Hip_M_Tattoo_Torso_000_M" },
    { id: "torso_03", zone: "torso" as TattooZone, label: "Aigle Impérial",collection: "mplowrider_overlays",overlay: "FM_Lor_M_Tattoo_Torso_000_M" },
    { id: "torso_04", zone: "torso" as TattooZone, label: "Tigre",         collection: "mpbiker_overlays",   overlay: "FM_Bik_M_Tattoo_Torso_000_M" },
    // LEFT ARM
    { id: "larm_01", zone: "left_arm" as TattooZone, label: "Ancre Marine",  collection: "mpbeach_overlays",   overlay: "FM_Bea_M_Tattoo_LeftArm_000_M" },
    { id: "larm_02", zone: "left_arm" as TattooZone, label: "Tête de Mort",  collection: "mphipster_overlays", overlay: "FM_Hip_M_Tattoo_LeftArm_000_M" },
    { id: "larm_03", zone: "left_arm" as TattooZone, label: "Serpent",        collection: "mplowrider_overlays",overlay: "FM_Lor_M_Tattoo_LeftArm_000_M" },
    // RIGHT ARM
    { id: "rarm_01", zone: "right_arm" as TattooZone, label: "Œil Qui Voit", collection: "mpbeach_overlays",   overlay: "FM_Bea_M_Tattoo_RightArm_000_M" },
    { id: "rarm_02", zone: "right_arm" as TattooZone, label: "Papillon",      collection: "mphipster_overlays", overlay: "FM_Hip_M_Tattoo_RightArm_000_M" },
    { id: "rarm_03", zone: "right_arm" as TattooZone, label: "Aztèque",       collection: "mplowrider_overlays",overlay: "FM_Lor_M_Tattoo_RightArm_000_M" },
    // LEFT LEG
    { id: "lleg_01", zone: "left_leg" as TattooZone, label: "Tribal Jambe",  collection: "mpbeach_overlays",   overlay: "FM_Bea_M_Tattoo_LeftLeg_000_M" },
    { id: "lleg_02", zone: "left_leg" as TattooZone, label: "Étoile Nautique",collection: "mphipster_overlays",overlay: "FM_Hip_M_Tattoo_LeftLeg_000_M" },
    // RIGHT LEG
    { id: "rleg_01", zone: "right_leg" as TattooZone, label: "Vague",         collection: "mpbeach_overlays",   overlay: "FM_Bea_M_Tattoo_RightLeg_000_M" },
    { id: "rleg_02", zone: "right_leg" as TattooZone, label: "Dagger",        collection: "mphipster_overlays", overlay: "FM_Hip_M_Tattoo_RightLeg_000_M" },
]
