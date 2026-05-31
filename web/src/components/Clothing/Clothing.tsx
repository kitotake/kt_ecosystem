// web/src/components/Clothing/Clothing.tsx
// Intégration FiveM-ClothingData (Colbss)
// Images: https://raw.githubusercontent.com/Colbss/FiveM-ClothingData/refs/heads/master/images/{MODEL}/base/{PREFIX}_{COMP}_{IDX}_{TEX}.webp
// JSON:   male_drawables.json / female_drawables.json / male_props.json / female_props.json

import styles from "./Clothing.module.scss";
import { useState, useEffect, useCallback, useRef } from "react";
import type {
  ClothingComponents,
  Props,
  ClothingComponent,
  Prop,
} from "../../types/appearance.types";

// ─── Types JSON Colbss ────────────────────────────────────────────────────
interface ColbssTexture {
  textureIndex: number;
  label: string | null;
  isBlank?: true;
}

interface ColbssDrawable {
  modelIndex: number;
  label: string | null;
  isBlank?: true;
  textures: ColbssTexture[];
  // props spéciaux masks
  hasGloves?: boolean;
  faceCovered?: boolean;
  shrinkFace?: boolean;
}

// La collection "base" est la collection par défaut
// Structure JSON: { "base": { "JBIB": [ ...drawables ], "BERD": [...] }, "mpchristmas2": {...} }
type ColbssCollectionData = Record<string, ColbssDrawable[]>;  // compType -> drawables
type ColbssJSON = Record<string, ColbssCollectionData>;        // collection -> compType -> drawables

// ─── Constantes ───────────────────────────────────────────────────────────
const GITHUB_BASE = "https://raw.githubusercontent.com/Colbss/FiveM-ClothingData/refs/heads/master";

// Mapping string → numérique (GTA V component IDs)
const COMP_STR_TO_NUM: Record<string, number> = {
  BERD: 1,  // Mask
  UPPR: 3,  // Torso
  LOWR: 4,  // Pants
  HAND: 5,  // Bags
  FEET: 6,  // Shoes
  TEEF: 7,  // Neck
  ACCS: 8,  // Undershirts
  TASK: 9,  // Vests
  JBIB: 11, // Jackets/Shirts
};

const PROP_STR_TO_NUM: Record<string, number> = {
  P_HEAD:  0, // Hats
  P_EYES:  1, // Glasses
  P_EARS:  2, // Ears
  P_LWRIST:6, // Watches
  P_RWRIST:7, // Bracelets
};

// Infos affichage par component
interface CompDisplayDef {
  strKey: string;
  numId: number;
  label: string;
  icon: string;
  prefix: "D"; // drawables = D
  isProp: false;
}
interface PropDisplayDef {
  strKey: string;
  numId: number;
  label: string;
  icon: string;
  prefix: "P"; // props = P
  isProp: true;
}
type DisplayDef = CompDisplayDef | PropDisplayDef;

const COMP_DEFS: CompDisplayDef[] = [
  { strKey:"BERD", numId:1,  label:"Masques",         icon:"🎭", prefix:"D", isProp:false },
  { strKey:"UPPR", numId:3,  label:"Haut du corps",   icon:"👔", prefix:"D", isProp:false },
  { strKey:"LOWR", numId:4,  label:"Pantalons",       icon:"👖", prefix:"D", isProp:false },
  { strKey:"HAND", numId:5,  label:"Sacs",            icon:"🎒", prefix:"D", isProp:false },
  { strKey:"FEET", numId:6,  label:"Chaussures",      icon:"👟", prefix:"D", isProp:false },
  { strKey:"TEEF", numId:7,  label:"Cou / Écharpes",  icon:"🧣", prefix:"D", isProp:false },
  { strKey:"ACCS", numId:8,  label:"Sous-vêtements",  icon:"👕", prefix:"D", isProp:false },
  { strKey:"TASK", numId:9,  label:"Gilets",          icon:"🦺", prefix:"D", isProp:false },
  { strKey:"JBIB", numId:11, label:"Vestes / Chemises",icon:"🧥",prefix:"D", isProp:false },
];

const PROP_DEFS: PropDisplayDef[] = [
  { strKey:"P_HEAD",  numId:0, label:"Chapeaux",  icon:"🎩", prefix:"P", isProp:true },
  { strKey:"P_EYES",  numId:1, label:"Lunettes",  icon:"🕶️",  prefix:"P", isProp:true },
  { strKey:"P_EARS",  numId:2, label:"Oreilles",  icon:"💎", prefix:"P", isProp:true },
  { strKey:"P_LWRIST",numId:6, label:"Montres",   icon:"⌚", prefix:"P", isProp:true },
  { strKey:"P_RWRIST",numId:7, label:"Bracelets", icon:"📿", prefix:"P", isProp:true },
];

const ALL_DEFS: DisplayDef[] = [...COMP_DEFS, ...PROP_DEFS];

const GROUPS = [
  { label: "Vêtements",   defs: COMP_DEFS },
  { label: "Accessoires", defs: PROP_DEFS  },
];

// ─── URL image GitHub ─────────────────────────────────────────────────────
function githubImgUrl(
  model: string,           // "mp_m_freemode_01" | "mp_f_freemode_01"
  collection: string,      // "base" | "mpchristmas2" | ...
  prefix: "D" | "P",
  compNum: number,
  modelIdx: number,
  texIdx: number
): string {
  return `${GITHUB_BASE}/images/${model}/${collection}/${prefix}_${compNum}_${modelIdx}_${texIdx}.webp`;
}

// ─── Hook : charge un JSON Colbss depuis GitHub ───────────────────────────
const JSON_CACHE: Record<string, ColbssJSON> = {};

function useColbssJSON(url: string) {
  const [data, setData]     = useState<ColbssJSON | null>(JSON_CACHE[url] ?? null);
  const [loading, setLoading] = useState(!JSON_CACHE[url]);

  useEffect(() => {
    if (JSON_CACHE[url]) { setData(JSON_CACHE[url]); setLoading(false); return; }
    setLoading(true);
    fetch(url)
      .then(r => r.json())
      .then((j: ColbssJSON) => {
        JSON_CACHE[url] = j;
        setData(j);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [url]);

  return { data, loading };
}

// ─── Composant image avec fallback ────────────────────────────────────────
function GImg({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [err, setErr] = useState(false);
  useEffect(() => setErr(false), [src]);
  if (err) return <div className={styles.imgErr}><span>?</span></div>;
  return (
    <img
      src={src} alt={alt}
      className={className}
      onError={() => setErr(true)}
      loading="lazy"
      decoding="async"
    />
  );
}

// ─── Panneau de sélection pour un composant/prop ──────────────────────────
const PAGE_SIZE = 20;

interface SelectorPanelProps {
  model: string;
  def: DisplayDef;
  collection: string;
  drawables: ColbssDrawable[];   // liste depuis le JSON
  currentIdx: number;            // drawable/prop index actuel
  currentTex: number;
  onChange: (idx: number, tex: number) => void;
  onRemove?: () => void;
}

function SelectorPanel({
  model, def, collection, drawables,
  currentIdx, currentTex, onChange, onRemove,
}: SelectorPanelProps) {
  const [page, setPage]       = useState(0);
  const [searchTerm, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const maxIdx = drawables.length > 0 ? drawables.length - 1 : 0;

  // Reset page quand on change de composant
  useEffect(() => {
    setPage(Math.floor(Math.max(0, currentIdx) / PAGE_SIZE));
    setSearch("");
  }, [def.strKey, currentIdx]);

  // Filtrage par label
  const filtered = searchTerm.trim()
    ? drawables.filter(d =>
        d.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(d.modelIndex).includes(searchTerm)
      )
    : null; // null = pas de filtre, on pagine

  const displayList = filtered ?? drawables.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages  = Math.ceil(drawables.length / PAGE_SIZE);

  // Infos de l'item courant
  const currentDrawable = drawables[currentIdx];
  const currentLabel    = currentDrawable?.label ?? `#${currentIdx}`;
  const textures        = currentDrawable?.textures ?? [];

  const imgSrc = (idx: number, tex: number) =>
    githubImgUrl(model, collection, def.prefix, def.numId, idx, tex);

  const select = useCallback((idx: number, tex = 0) => {
    onChange(idx, tex);
    setPage(Math.floor(idx / PAGE_SIZE));
  }, [onChange]);

  return (
    <div className={styles.selectorPanel}>

      {/* ── Preview item sélectionné ── */}
      <div className={styles.previewRow}>
        <div className={styles.previewImgWrap}>
          <GImg
            src={imgSrc(Math.max(0, currentIdx), currentTex)}
            alt={currentLabel}
            className={styles.previewImg}
          />
        </div>

        <div className={styles.previewMeta}>
          <div className={styles.previewName}>
            {currentDrawable?.isBlank
              ? <span className={styles.blankBadge}>Vide</span>
              : currentLabel}
          </div>
          <div className={styles.previewIdx}>Index #{currentIdx}</div>

          {/* Textures disponibles */}
          {textures.length > 1 && (
            <div className={styles.texRow}>
              <span className={styles.texLabel}>Textures</span>
              <div className={styles.texGrid}>
                {textures.map(t => (
                  <button
                    key={t.textureIndex}
                    className={[styles.texBtn, currentTex === t.textureIndex ? styles.texBtnActive : ""].join(" ")}
                    onClick={() => onChange(currentIdx, t.textureIndex)}
                    title={t.label ?? `Texture ${t.textureIndex}`}
                  >
                    <GImg
                      src={imgSrc(currentIdx, t.textureIndex)}
                      alt={`tex ${t.textureIndex}`}
                      className={styles.texImg}
                    />
                    {t.isBlank && <div className={styles.texBlankOverlay}>✕</div>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Props spéciaux */}
          {currentDrawable?.faceCovered && (
            <div className={styles.specialBadge}>🎭 Visage couvert</div>
          )}
          {currentDrawable?.hasGloves && (
            <div className={styles.specialBadge}>🧤 Avec gants</div>
          )}

          {/* Retirer (props) */}
          {onRemove && currentIdx >= 0 && (
            <button className={styles.removeBtn} onClick={onRemove}>
              ✕ Retirer
            </button>
          )}
        </div>
      </div>

      {/* ── Barre de recherche + navigation ── */}
      <div className={styles.toolbar}>
        <input
          ref={searchRef}
          type="text"
          className={styles.searchInput}
          placeholder="🔍  Rechercher un nom ou index…"
          value={searchTerm}
          onChange={e => setSearch(e.target.value)}
        />
        {!searchTerm && (
          <div className={styles.pageNav}>
            <button
              className={styles.pageBtn}
              disabled={page <= 0}
              onClick={() => setPage(p => p - 1)}
            >‹</button>
            <span className={styles.pageInfo}>
              {page * PAGE_SIZE}–{Math.min((page + 1) * PAGE_SIZE - 1, maxIdx)} / {maxIdx}
            </span>
            <button
              className={styles.pageBtn}
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
            >›</button>
          </div>
        )}
      </div>

      {/* ── Grille d'items ── */}
      <div className={styles.itemGrid}>
        {displayList.length === 0 && (
          <div className={styles.noResults}>Aucun résultat</div>
        )}
        {displayList.map(d => {
          const isActive = d.modelIndex === currentIdx;
          return (
            <button
              key={d.modelIndex}
              className={[
                styles.itemCard,
                isActive ? styles.itemCardActive : "",
                d.isBlank ? styles.itemCardBlank : "",
              ].join(" ")}
              onClick={() => select(d.modelIndex, 0)}
              title={d.label ?? `#${d.modelIndex}`}
            >
              <div className={styles.itemImgWrap}>
                <GImg
                  src={imgSrc(d.modelIndex, 0)}
                  alt={d.label ?? `#${d.modelIndex}`}
                  className={styles.itemImg}
                />
                {d.isBlank && <div className={styles.blankOverlay}>—</div>}
              </div>
              <div className={styles.itemLabel}>
                {d.label
                  ? <span className={styles.itemName}>{d.label}</span>
                  : <span className={styles.itemNoName}>#{d.modelIndex}</span>}
                <span className={styles.itemIdx}>#{d.modelIndex}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Message si recherche active */}
      {searchTerm && filtered && (
        <div className={styles.searchCount}>
          {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────
interface ClothingProps {
  gender: string;
  components: ClothingComponents;
  props: Props;
  onChangeComponents: (d: ClothingComponents) => void;
  onChangeProps:      (d: Props) => void;
}

export default function Clothing({
  gender, components, props,
  onChangeComponents, onChangeProps,
}: ClothingProps) {
  const [activeGroup,  setActiveGroup]  = useState(0);
  const [activeDefKey, setActiveDefKey] = useState<string>("JBIB");
  const [collection,   setCollection]   = useState("base");

  const isFemale  = gender === "mp_f_freemode_01";
  const modelStr  = isFemale ? "mp_f_freemode_01" : "mp_m_freemode_01";

  // ── Chargement JSON ───────────────────────────────────────────────────
  const drawablesUrl = `${GITHUB_BASE}/${isFemale ? "female" : "male"}_drawables.json`;
  const propsUrl     = `${GITHUB_BASE}/${isFemale ? "female" : "male"}_props.json`;

  const { data: drawablesJSON, loading: loadingD } = useColbssJSON(drawablesUrl);
  const { data: propsJSON,     loading: loadingP } = useColbssJSON(propsUrl);

  const loading = loadingD || loadingP;

  // Collections disponibles
  const allCollections = drawablesJSON ? Object.keys(drawablesJSON) : ["base"];

  // Récupère les drawables d'un composant dans la collection active
  const getDrawables = (strKey: string): ColbssDrawable[] => {
    const json = PROP_STR_TO_NUM[strKey] !== undefined ? propsJSON : drawablesJSON;
    return json?.[collection]?.[strKey] ?? [];
  };

  // ── Valeurs courantes ─────────────────────────────────────────────────
  const getCompVal = (numId: number): ClothingComponent =>
    components[numId] ?? { drawable: 0, texture: 0, palette: 0 };

  const getPropVal = (numId: number): Prop =>
    props[numId] ?? { propIndex: -1, propTextureIndex: 0 };

  const getCurrentIdx = (def: DisplayDef): number =>
    def.isProp ? getPropVal(def.numId).propIndex : getCompVal(def.numId).drawable;

  const getCurrentTex = (def: DisplayDef): number =>
    def.isProp ? getPropVal(def.numId).propTextureIndex : getCompVal(def.numId).texture;

  // ── Setters ───────────────────────────────────────────────────────────
  const setVal = (def: DisplayDef, idx: number, tex: number) => {
    if (def.isProp) {
      onChangeProps({ ...props, [def.numId]: { propIndex: idx, propTextureIndex: tex } });
    } else {
      onChangeComponents({ ...components, [def.numId]: { drawable: idx, texture: tex, palette: 0 } });
    }
  };

  const removeProp = (numId: number) => {
    onChangeProps({ ...props, [numId]: { propIndex: -1, propTextureIndex: 0 } });
  };

  const isUsed = (def: DisplayDef) =>
    def.isProp ? getPropVal(def.numId).propIndex >= 0 : getCompVal(def.numId).drawable > 0;

  // Def active
  const groupDefs = GROUPS[activeGroup].defs as DisplayDef[];
  const activeDef = (ALL_DEFS.find(d => d.strKey === activeDefKey) ?? groupDefs[0]) as DisplayDef;

  return (
    <div className={styles.wrapper}>

      {/* ── Onglets groupes ── */}
      <div className={styles.groupTabs}>
        {GROUPS.map((g, i) => (
          <button
            key={g.label}
            className={[styles.groupTab, activeGroup === i ? styles.groupTabActive : ""].join(" ")}
            onClick={() => {
              setActiveGroup(i);
              setActiveDefKey((g.defs[0] as DisplayDef).strKey);
            }}
          >
            {g.label}
          </button>
        ))}

        {/* Sélecteur de collection */}
        <select
          className={styles.collectionSelect}
          value={collection}
          onChange={e => setCollection(e.target.value)}
          title="Collection DLC"
        >
          {allCollections.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span>Chargement des données vêtements…</span>
        </div>
      )}

      {!loading && (
        <div className={styles.layout}>

          {/* ── Sidebar ── */}
          <nav className={styles.sidebar}>
            {groupDefs.map((def: DisplayDef) => {
              const used   = isUsed(def);
              const active = activeDefKey === def.strKey;
              const idx    = getCurrentIdx(def);
              const tex    = getCurrentTex(def);
              const drawables = getDrawables(def.strKey);
              const label  = drawables[idx]?.label;

              return (
                <button
                  key={def.strKey}
                  className={[
                    styles.catBtn,
                    active ? styles.catBtnActive : "",
                    used   ? styles.catBtnUsed   : "",
                  ].join(" ")}
                  onClick={() => setActiveDefKey(def.strKey)}
                >
                  {/* Miniature */}
                  <div className={styles.catThumbWrap}>
                    {(used || active) && idx >= 0 ? (
                      <GImg
                        src={githubImgUrl(modelStr, collection, def.prefix, def.numId, Math.max(0, idx), tex)}
                        alt=""
                        className={styles.catThumb}
                      />
                    ) : (
                      <span className={styles.catIcon}>{def.icon}</span>
                    )}
                  </div>

                  <div className={styles.catMeta}>
                    <span className={styles.catLabel}>{def.label}</span>
                    <span className={styles.catSub}>
                      {def.isProp && idx < 0
                        ? "—"
                        : label ?? `#${Math.max(0, idx)}`}
                    </span>
                  </div>

                  {used && <div className={styles.usedDot} />}
                </button>
              );
            })}
          </nav>

          {/* ── Panneau principal ── */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelIcon}>{activeDef.icon}</span>
              <span className={styles.panelTitle}>{activeDef.label}</span>
              <span className={styles.panelMeta}>
                {isFemale ? "♀" : "♂"} · {getDrawables(activeDef.strKey).length} items · {collection}
              </span>
            </div>

            {getDrawables(activeDef.strKey).length === 0 ? (
              <div className={styles.emptyCollection}>
                <span>Aucun item dans la collection «&nbsp;{collection}&nbsp;»</span>
              </div>
            ) : (
              <SelectorPanel
                model={modelStr}
                def={activeDef}
                collection={collection}
                drawables={getDrawables(activeDef.strKey)}
                currentIdx={getCurrentIdx(activeDef)}
                currentTex={getCurrentTex(activeDef)}
                onChange={(idx, tex) => setVal(activeDef, idx, tex)}
                onRemove={activeDef.isProp ? () => removeProp(activeDef.numId) : undefined}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
