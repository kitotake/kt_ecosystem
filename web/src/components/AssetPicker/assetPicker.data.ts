// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ASSET PICKER — DONNÉES DES CATÉGORIES GTA V / KT_CHARACTER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { AssetCategory, GenderModel } from "./assetPicker.types";

// Catégories communes aux deux genres
const SHARED_CLOTHING: AssetCategory[] = [
  { id: "jackets",     label: "Vestes / Manteaux",   icon: "🧥", count: 121, componentId: 11 },
  { id: "torsos",      label: "Hauts du corps",       icon: "👔", count: 80,  componentId: 3  },
  { id: "undershirts", label: "Sous-vêtements",       icon: "👕", count: 80,  componentId: 8  },
  { id: "pants",       label: "Pantalons",            icon: "👖", count: 80,  componentId: 4  },
  { id: "shoes",       label: "Chaussures",           icon: "👟", count: 80,  componentId: 6  },
  { id: "bags",        label: "Sacs à dos",           icon: "🎒", count: 60,  componentId: 5  },
  { id: "vests",       label: "Gilets / Armures",     icon: "🦺", count: 40,  componentId: 9  },
  { id: "decals",      label: "Décals / Logos",       icon: "🔖", count: 60,  componentId: 10 },
  { id: "masks",       label: "Masques",              icon: "🎭", count: 60,  componentId: 1  },
  { id: "necks",       label: "Colliers / Écharpes",  icon: "💎", count: 60,  componentId: 7  },
];

const SHARED_PROPS: AssetCategory[] = [
  { id: "hats",     label: "Chapeaux",  icon: "🎩", count: 80, propAnchor: 0 },
  { id: "glasses",  label: "Lunettes",  icon: "🕶️",  count: 50, propAnchor: 1 },
  { id: "watches",  label: "Montres",   icon: "⌚", count: 30, propAnchor: 6 },
];

const SHARED_OVERLAYS: AssetCategory[] = [
  { id: "aging",      label: "Vieillissement", icon: "🕰️",  count: 16, overlayId: 3 },
  { id: "complextion",label: "Teint / Peau",   icon: "💧", count: 12, overlayId: 6 },
  { id: "makeup",     label: "Maquillage",     icon: "✨", count: 74, overlayId: 4 },
];

export const CATEGORIES: Record<GenderModel, AssetCategory[]> = {
  mp_f_freemode_01: [
    // Visage
    { id: "faces",       label: "Visages",             icon: "👤", count: 92, direct: true },
    // Cheveux
    { id: "hair",        label: "Coiffures",            icon: "✂️",  count: 76, componentId: 2 },
    // Vêtements partagés
    ...SHARED_CLOTHING,
    // Props partagés
    ...SHARED_PROPS,
    // Props féminins spécifiques
    { id: "earrings",    label: "Boucles d'oreilles",   icon: "💍", count: 44, propAnchor: 2 },
    { id: "bracelets",   label: "Bracelets",            icon: "📿", count: 22, propAnchor: 7 },
    // Overlays partagés
    ...SHARED_OVERLAYS,
    // Overlays féminins
    { id: "lipstick",    label: "Rouge à lèvres",       icon: "💄", count: 11, overlayId: 8 },
    { id: "facialHair",  label: "Poils / Duvet",        icon: "🪮", count: 30, overlayId: 1 },
  ],

  mp_m_freemode_01: [
    // Visage
    { id: "faces",       label: "Visages",              icon: "👤", count: 92, direct: true },
    // Cheveux
    { id: "hair",        label: "Coiffures",            icon: "✂️",  count: 76, componentId: 2 },
    // Vêtements partagés
    ...SHARED_CLOTHING,
    // Props partagés
    ...SHARED_PROPS,
    // Overlays partagés
    ...SHARED_OVERLAYS,
    // Overlays masculins
    { id: "facialHair",  label: "Barbe / Moustache",   icon: "🧔", count: 28, overlayId: 1 },
  ],
};

// Groupe les catégories par section pour l'affichage sidebar
export const CATEGORY_GROUPS = [
  { label: "Visage",      ids: ["faces", "hair", "aging", "complextion"] },
  { label: "Vêtements",   ids: ["jackets", "torsos", "undershirts", "pants", "shoes", "bags", "vests", "decals", "masks", "necks"] },
  { label: "Accessoires", ids: ["hats", "glasses", "watches", "earrings", "bracelets"] },
  { label: "Beauté",      ids: ["makeup", "lipstick", "facialHair"] },
];
