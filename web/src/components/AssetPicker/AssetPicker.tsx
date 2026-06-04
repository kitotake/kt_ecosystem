// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ASSET PICKER — COMPOSANT PRINCIPAL (fixed TS6133 + overlays UI)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { useCallback, memo } from "react";
import { useState } from "react";
import styles from "./AssetPicker.module.scss";
import { useAssetPicker } from "./useAssetPicker";
import { CATEGORIES, CATEGORY_GROUPS } from "./assetPicker.data";
import type { AssetPickerProps, AssetCategory } from "./assetPicker.types";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUB — AssetItem
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
interface AssetItemProps {
  index: number;
  imgSrc: string;
  selected: boolean;
  isOverlay: boolean;
  isDirect: boolean;
  onPick: (index: number) => void;
}

const AssetItem = memo(({ index, imgSrc, selected, isOverlay, isDirect, onPick }: AssetItemProps) => {
  const [imgFailed, setImgFailed] = useState(false);

  // Pour overlays et directs, on montre toujours un fallback stylisé
  const showFallback = imgFailed || isOverlay || isDirect;

  const overlayEmojis: Record<number, string> = {
    0: "🎨", 1: "🧔", 2: "👁", 3: "🕰", 4: "💄",
    5: "🌸", 6: "💧", 7: "☀️", 8: "👄", 9: "✨",
    10: "🦲", 11: "🩹", 12: "🩺",
  };

  return (
    <div
      className={`${styles.assetItem} ${selected ? styles.selected : ""}`}
      onClick={() => onPick(index)}
      role="button"
      tabIndex={0}
      aria-label={`Variante ${index}${selected ? " (sélectionnée)" : ""}`}
      onKeyDown={(e) => e.key === "Enter" && onPick(index)}
    >
      <div className={styles.imgWrap}>
        {showFallback ? (
          <div className={`${styles.imgFallback} ${isOverlay ? styles.overlayFallback : ""}`}>
            {isOverlay ? (
              <>
                <span className={styles.fallbackIcon}>
                  {index === 0 ? "🚫" : "✦"}
                </span>
                <span className={styles.fallbackIdx}>
                  {index === 0 ? "Aucun" : `#${index}`}
                </span>
              </>
            ) : (
              <>
                <span className={styles.fallbackIcon}>🖼️</span>
                <span className={styles.fallbackIdx}>#{index}</span>
              </>
            )}
          </div>
        ) : (
          <img
            src={imgSrc}
            alt={`Variante ${index}`}
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        )}
      </div>
      <div className={styles.itemLabel}>
        {index === 0 && isOverlay ? "Aucun" : `#${index}`}
      </div>
      {selected && <div className={styles.checkBadge}>✓</div>}
    </div>
  );
});
AssetItem.displayName = "AssetItem";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUB — AssetGrid
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
interface AssetGridProps {
  cat: AssetCategory;
  selectedIndex: number | undefined;
  getImgSrc: (cat: AssetCategory, index: number) => string;
  onPick: (catId: string, index: number) => void;
}

const AssetGrid = memo(({ cat, selectedIndex, getImgSrc, onPick }: AssetGridProps) => {
  const isOverlay = cat.overlayId != null;
  const isDirect  = cat.direct === true;

  return (
    <div className={styles.assetGrid}>
      {Array.from({ length: cat.count }, (_, i) => (
        <AssetItem
          key={i}
          index={i}
          imgSrc={getImgSrc(cat, i)}
          selected={selectedIndex === i}
          isOverlay={isOverlay}
          isDirect={isDirect}
          onPick={(idx) => onPick(cat.id, idx)}
        />
      ))}
    </div>
  );
});
AssetGrid.displayName = "AssetGrid";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN — AssetPicker
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function AssetPicker({
  defaultGender = "mp_f_freemode_01",
  initialSelections,
  onChange,
  onValidate,
  assetBasePath = "./assets",
}: AssetPickerProps) {

  const {
    gender,
    activeCatId,
    activeCat,
    catFilter,
    categories,
    currentSel,
    selectionCount,
    setGender,
    openCategory,
    pickItem,
    removeSelection,
    clearAll,
    setCatFilter,
    getPayload,
    getImgSrc,
  } = useAssetPicker({ defaultGender, initialSelections, assetBasePath, onChange });

  // ── Validation ────────────────────────────────────────────────────────────
  const handleValidate = useCallback(() => {
    onValidate?.(getPayload());
  }, [onValidate, getPayload]);

  // ── Sidebar groupée ───────────────────────────────────────────────────────
  const renderSidebar = () => {
    const allCats = CATEGORIES[gender];
    const filteredIds = new Set(categories.map((c) => c.id));

    return CATEGORY_GROUPS.map((group) => {
      const groupCats = group.ids
        .map((id) => allCats.find((c) => c.id === id))
        .filter((c): c is AssetCategory => !!c && filteredIds.has(c.id));

      if (groupCats.length === 0) return null;

      return (
        <div key={group.label}>
          <div className={styles.groupLabel}>{group.label}</div>
          {groupCats.map((cat) => {
            const selVal = currentSel[cat.id];
            const hasSel = selVal !== undefined;
            return (
              <button
                key={cat.id}
                className={`${styles.catBtn} ${activeCatId === cat.id ? styles.active : ""}`}
                onClick={() => openCategory(cat.id)}
                title={cat.label}
              >
                <span className={styles.catLeft}>
                  <span className={styles.catIcon}>{cat.icon}</span>
                  <span className={styles.catLabel}>{cat.label}</span>
                </span>
                <span className={`${styles.catTag} ${hasSel ? styles.selected : ""}`}>
                  {hasSel ? `#${selVal}` : cat.count}
                </span>
              </button>
            );
          })}
        </div>
      );
    });
  };

  // ── Barre de sélections ───────────────────────────────────────────────────
  const renderSelBar = () => {
    const entries = Object.entries(currentSel);
    const allCats = CATEGORIES[gender];

    if (entries.length === 0) {
      return (
        <div className={styles.selBar}>
          <div className={styles.selPlaceholder}>
            <span>👆</span>
            Cliquez sur une miniature pour la sélectionner
          </div>
          <div className={styles.actionsRow}>
            <button className={styles.validateBtn} disabled onClick={handleValidate}>
              ✓ Valider la tenue
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.selBar}>
        <div className={styles.selBarTop}>
          <span className={styles.selBarTitle}>
            <span className={styles.selBarDot} />
            {entries.length} sélectionné{entries.length > 1 ? "s" : ""}
          </span>
          <button className={styles.clearAllBtn} onClick={clearAll}>
            🗑️ Tout effacer
          </button>
        </div>

        <div className={styles.selRows}>
          {entries.map(([catId, val]) => {
            const cat = allCats.find((c) => c.id === catId);
            return (
              <div key={catId} className={styles.selRow}>
                <span className={styles.selRowLeft}>
                  <span className={styles.selRowIcon}>{cat?.icon ?? "📦"}</span>
                  <span className={styles.selRowLabel}>{cat?.label ?? catId}</span>
                </span>
                <span className={styles.selRowRight}>
                  <span className={styles.selRowCode}>#{val}</span>
                  <button
                    className={styles.selRowDel}
                    onClick={() => removeSelection(catId)}
                    aria-label={`Retirer ${cat?.label}`}
                  >
                    ✕
                  </button>
                </span>
              </div>
            );
          })}
        </div>

        <div className={styles.actionsRow}>
          <button
            className={styles.validateBtn}
            onClick={handleValidate}
            disabled={entries.length === 0}
          >
            ✓ Valider la tenue ({entries.length})
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.picker}>

      {/* ── Topbar ─────────────────────────────────────────────────────── */}
      <div className={styles.topbar}>
        <button
          className={`${styles.genderBtn} ${gender === "mp_f_freemode_01" ? styles.active : ""}`}
          onClick={() => setGender("mp_f_freemode_01")}
        >
          <span className={styles.genderIcon}>♀</span> Femme
        </button>
        <button
          className={`${styles.genderBtn} ${gender === "mp_m_freemode_01" ? styles.active : ""}`}
          onClick={() => setGender("mp_m_freemode_01")}
        >
          <span className={styles.genderIcon}>♂</span> Homme
        </button>

        <input
          className={`${styles.searchInput}`}
          type="text"
          placeholder="Filtrer catégories…"
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
        />

        <span className={`${styles.totalBadge} ${selectionCount > 0 ? styles.hasItems : ""}`}>
          {selectionCount} sélectionné{selectionCount > 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <div className={styles.body}>

        {/* Sidebar catégories */}
        <div className={styles.sidebar}>
          {renderSidebar()}
        </div>

        {/* Panneau droit */}
        <div className={styles.rightPanel}>

          {/* Header du panneau */}
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>
              {activeCat ? `${activeCat.icon} ${activeCat.label}` : "Choisir une catégorie"}
            </span>
            {activeCat && (
              <span className={styles.panelMeta}>
                {activeCat.overlayId != null ? "overlay" :
                 activeCat.propAnchor != null ? "prop" :
                 activeCat.componentId != null ? `comp ${activeCat.componentId}` : "direct"}
                {currentSel[activeCat.id] !== undefined && ` · #${currentSel[activeCat.id]}`}
              </span>
            )}
          </div>

          {/* Grille d'assets */}
          <div className={styles.gridWrapper}>
            {!activeCat ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>🗂️</span>
                <span className={styles.emptyTitle}>Aucune catégorie sélectionnée</span>
                <span className={styles.emptyHint}>
                  Choisissez une catégorie dans le menu de gauche
                </span>
              </div>
            ) : (
              <AssetGrid
                cat={activeCat}
                selectedIndex={currentSel[activeCat.id]}
                getImgSrc={getImgSrc}
                onPick={pickItem}
              />
            )}
          </div>

          {/* Barre de sélection + bouton valider */}
          {renderSelBar()}
        </div>
      </div>
    </div>
  );
}