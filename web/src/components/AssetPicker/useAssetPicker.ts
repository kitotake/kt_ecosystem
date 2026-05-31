// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ASSET PICKER — HOOK LOGIQUE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { useState, useCallback, useMemo } from "react";
import { CATEGORIES } from "./assetPicker.data";
import type {
  GenderModel,
  GenderSelections,
  PickerSelection,
  AssetPayload,
  AssetCategory,
} from "./assetPicker.types";

interface UseAssetPickerOptions {
  defaultGender?: GenderModel;
  initialSelections?: Partial<GenderSelections>;
  assetBasePath?: string;
  onChange?: (payload: AssetPayload, sel: PickerSelection) => void;
}

export function useAssetPicker({
  defaultGender = "mp_f_freemode_01",
  initialSelections,
  assetBasePath = "./assets",
  onChange,
}: UseAssetPickerOptions = {}) {
  const [gender, setGenderState] = useState<GenderModel>(defaultGender);
  const [activeCatId, setActiveCatId] = useState<string | null>(null);
  const [catFilter, setCatFilter] = useState("");
  const [selections, setSelections] = useState<GenderSelections>({
    mp_f_freemode_01: initialSelections?.mp_f_freemode_01 ?? {},
    mp_m_freemode_01: initialSelections?.mp_m_freemode_01 ?? {},
  });

  // ── Catégories filtrées pour le genre actif ─────────────────────────────
  const categories = useMemo<AssetCategory[]>(() => {
    const cats = CATEGORIES[gender];
    if (!catFilter.trim()) return cats;
    const f = catFilter.toLowerCase();
    return cats.filter((c) => c.label.toLowerCase().includes(f) || c.id.includes(f));
  }, [gender, catFilter]);

  // ── Sélections pour le genre actif ─────────────────────────────────────
  const currentSel = useMemo<PickerSelection>(
    () => selections[gender],
    [selections, gender]
  );

  // ── Catégorie active ────────────────────────────────────────────────────
  const activeCat = useMemo<AssetCategory | null>(
    () => CATEGORIES[gender].find((c) => c.id === activeCatId) ?? null,
    [gender, activeCatId]
  );

  // ── Nombre de sélections pour le genre actif ────────────────────────────
  const selectionCount = Object.keys(currentSel).length;

  // ── Construction du payload kt_character ────────────────────────────────
  const buildPayload = useCallback(
    (sel: PickerSelection, g: GenderModel): AssetPayload => {
      const cats = CATEGORIES[g];
      const components: AssetPayload["components"] = {};
      const props: AssetPayload["props"] = {};
      const overlays: AssetPayload["overlays"] = {};

      for (const [catId, val] of Object.entries(sel)) {
        const cat = cats.find((c) => c.id === catId);
        if (!cat) continue;

        if (cat.componentId != null) {
          components[cat.componentId] = { drawable: val, texture: 0, palette: 0 };
        } else if (cat.propAnchor != null) {
          props[cat.propAnchor] = { propIndex: val, propTextureIndex: 0 };
        } else if (cat.overlayId != null) {
          overlays[cat.overlayId] = {
            index: val,
            opacity: 1.0,
            firstColor: 0,
            secondColor: 0,
          };
        }
      }

      return { model: g, components, props, overlays };
    },
    []
  );

  // ── URL image ────────────────────────────────────────────────────────────
  const getImgSrc = useCallback(
    (cat: AssetCategory, index: number): string => {
      if (cat.direct) {
        return `${assetBasePath}/${gender}/${cat.id}/${index}.png`;
      }
      return `${assetBasePath}/${gender}/${cat.id}/${index}/0.png`;
    },
    [gender, assetBasePath]
  );

  // ── Actions ──────────────────────────────────────────────────────────────
  const setGender = useCallback((g: GenderModel) => {
    setGenderState(g);
    setActiveCatId(null);
  }, []);

  const openCategory = useCallback((catId: string) => {
    setActiveCatId(catId);
  }, []);

  const pickItem = useCallback(
    (catId: string, index: number) => {
      setSelections((prev) => {
        const prevSel = prev[gender];
        const newSel =
          prevSel[catId] === index
            ? // Désélection si on reclique
              Object.fromEntries(Object.entries(prevSel).filter(([k]) => k !== catId))
            : { ...prevSel, [catId]: index };

        const next = { ...prev, [gender]: newSel };
        onChange?.(buildPayload(newSel, gender), newSel);
        return next;
      });
    },
    [gender, onChange, buildPayload]
  );

  const removeSelection = useCallback(
    (catId: string) => {
      setSelections((prev) => {
        const newSel = Object.fromEntries(
          Object.entries(prev[gender]).filter(([k]) => k !== catId)
        );
        const next = { ...prev, [gender]: newSel };
        onChange?.(buildPayload(newSel, gender), newSel);
        return next;
      });
    },
    [gender, onChange, buildPayload]
  );

  const clearAll = useCallback(() => {
    setSelections((prev) => {
      const next = { ...prev, [gender]: {} };
      onChange?.(buildPayload({}, gender), {});
      return next;
    });
  }, [gender, onChange, buildPayload]);

  const getPayload = useCallback(
    () => buildPayload(currentSel, gender),
    [buildPayload, currentSel, gender]
  );

  return {
    // État
    gender,
    activeCatId,
    activeCat,
    catFilter,
    categories,
    currentSel,
    selectionCount,

    // Actions
    setGender,
    openCategory,
    pickItem,
    removeSelection,
    clearAll,
    setCatFilter,
    getPayload,
    getImgSrc,
  };
}
