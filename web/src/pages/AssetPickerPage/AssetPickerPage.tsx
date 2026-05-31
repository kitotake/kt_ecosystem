// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ASSET PICKER PAGE
// Chemin : web/src/pages/AssetPickerPage/AssetPickerPage.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { useCallback } from "react";
import { AssetPicker } from "../../components/AssetPicker";
import type { AssetPayload, GenderModel } from "../../components/AssetPicker";
import type { ClothingComponents, Props, HeadOverlays } from "../../types/appearance.types";

// ── Conversions payload → types kt_character ──────────────────────────────

function payloadToComponents(payload: AssetPayload): ClothingComponents {
  const result: ClothingComponents = {};
  for (const [key, val] of Object.entries(payload.components)) {
    result[Number(key)] = {
      drawable: val.drawable,
      texture:  val.texture,
      palette:  val.palette,
    };
  }
  return result;
}

function payloadToProps(payload: AssetPayload): Props {
  const result: Props = {};
  for (const [key, val] of Object.entries(payload.props)) {
    result[Number(key)] = {
      propIndex:        val.propIndex,
      propTextureIndex: val.propTextureIndex,
    };
  }
  return result;
}

function payloadToOverlays(payload: AssetPayload): HeadOverlays {
  const result: HeadOverlays = {};
  for (const [key, val] of Object.entries(payload.overlays)) {
    result[Number(key)] = {
      index:       val.index,
      opacity:     val.opacity,
      firstColor:  val.firstColor,
      secondColor: val.secondColor,
    };
  }
  return result;
}

// ── Props ─────────────────────────────────────────────────────────────────

interface AssetPickerPageProps {
  /** Genre actif du personnage (synchronisé avec l'étape identité) */
  gender: GenderModel;
  /** Appelé à chaque sélection → preview live dans le jeu */
  onPreview?: (
    components: ClothingComponents,
    props:      Props,
    overlays:   HeadOverlays
  ) => void;
  /** Appelé sur "Valider la sélection" → sauvegarde + nextStep() */
  onValidate?: (
    components: ClothingComponents,
    props:      Props,
    overlays:   HeadOverlays
  ) => void;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function AssetPickerPage({
  gender,
  onPreview,
  onValidate,
}: AssetPickerPageProps) {

  const handleChange = useCallback(
    (payload: AssetPayload) => {
      onPreview?.(
        payloadToComponents(payload),
        payloadToProps(payload),
        payloadToOverlays(payload)
      );
    },
    [onPreview]
  );

  const handleValidate = useCallback(
    (payload: AssetPayload) => {
      onValidate?.(
        payloadToComponents(payload),
        payloadToProps(payload),
        payloadToOverlays(payload)
      );
    },
    [onValidate]
  );

  return (
    <AssetPicker
      defaultGender={gender}
      assetBasePath="./assets"
      onChange={handleChange}
      onValidate={handleValidate}
    />
  );
}