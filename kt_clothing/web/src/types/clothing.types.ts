// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KT_CLOTHING — TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ComponentDef {
    id:   number
    name: string
    icon: string
}

export interface PropDef {
    anchor: number
    name:   string
    icon:   string
}

export const COMPONENT_DEFS: ComponentDef[] = [
    { id: 1,  name: "Masques",         icon: "🎭" },
    { id: 3,  name: "Haut du corps",   icon: "👔" },
    { id: 4,  name: "Pantalons",       icon: "👖" },
    { id: 5,  name: "Sacs",            icon: "🎒" },
    { id: 6,  name: "Chaussures",      icon: "👟" },
    { id: 7,  name: "Accessoires",     icon: "🧣" },
    { id: 8,  name: "Sous-vêtement",   icon: "👕" },
    { id: 9,  name: "Gilet / Armure",  icon: "🦺" },
    { id: 10, name: "Décals / Logos",  icon: "🔖" },
    { id: 11, name: "Veste / Manteau", icon: "🧥" },
]

export const PROP_DEFS: PropDef[] = [
    { anchor: 0, name: "Chapeaux",  icon: "🎩" },
    { anchor: 1, name: "Lunettes",  icon: "🕶️"  },
    { anchor: 2, name: "Oreilles",  icon: "💎" },
    { anchor: 6, name: "Montres",   icon: "⌚" },
    { anchor: 7, name: "Bracelets", icon: "📿" },
]

export const MAX_DRAWABLE  = 128
export const MAX_TEXTURE   = 16
export const MAX_PROP      = 64
