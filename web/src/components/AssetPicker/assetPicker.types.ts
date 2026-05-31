// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ASSET PICKER — TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type GenderModel = "mp_f_freemode_01" | "mp_m_freemode_01";

export interface AssetCategory {
  id: string;
  label: string;
  icon: string;
  count: number;

  // Résolution du type de donnée GTA
  componentId?: number | null; // SetPedComponentVariation
  propAnchor?: number | null;  // SetPedPropIndex
  overlayId?: number | null;   // SetPedHeadOverlay
  direct?: boolean;            // images à plat (ex: faces/0.png vs hair/0/0.png)
}

export interface PickerSelection {
  [catId: string]: number; // catId → index sélectionné
}

export interface GenderSelections {
  mp_f_freemode_01: PickerSelection;
  mp_m_freemode_01: PickerSelection;
}

export interface AssetPayload {
  model: GenderModel;
  components: Record<number, { drawable: number; texture: number; palette: number }>;
  props: Record<number, { propIndex: number; propTextureIndex: number }>;
  overlays: Record<number, { index: number; opacity: number; firstColor: number; secondColor: number }>;
}

export interface AssetPickerProps {
  /** Modèle de départ */
  defaultGender?: GenderModel;
  /** Sélections initiales (pour pré-remplir depuis les données existantes du perso) */
  initialSelections?: Partial<GenderSelections>;
  /** Appelé à chaque changement de sélection */
  onChange?: (payload: AssetPayload, selections: PickerSelection) => void;
  /** Appelé quand l'utilisateur valide */
  onValidate?: (payload: AssetPayload) => void;
  /** Chemin de base pour les images (ex: "/assets" ou "./assets") */
  assetBasePath?: string;
}
