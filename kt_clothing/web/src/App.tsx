// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KT_CLOTHING — APP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { useClothing } from "./hooks/useClothing"
import { COMPONENT_DEFS, PROP_DEFS } from "./types/clothing.types"
import "./styles/global.scss"

const S = {
  panel:   { position:"fixed" as const, left:24, top:24, width:340, maxHeight:"calc(100vh - 48px)", background:"#16161f", border:"1px solid rgba(0,217,255,0.12)", borderRadius:12, display:"flex", flexDirection:"column" as const, overflow:"hidden", boxShadow:"0 24px 64px rgba(0,0,0,0.7)" },
  header:  { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", borderBottom:"1px solid rgba(0,217,255,0.08)" },
  title:   { fontSize:16, fontWeight:700, color:"#f8f8ff", margin:0 },
  closeBtn:{ background:"transparent", border:"none", color:"#707084", fontSize:18, cursor:"pointer", padding:"2px 6px" },
  body:    { flex:1, overflowY:"auto" as const, padding:"8px 12px" },
  section: { marginBottom:8 },
  sectionLabel: { display:"block", fontSize:10, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase" as const, color:"#707084", padding:"8px 4px 4px" },
  card:    { background:"rgba(0,217,255,0.02)", border:"1px solid rgba(0,217,255,0.07)", borderRadius:8, marginBottom:4, overflow:"hidden" },
  cardHeader: { display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%", padding:"8px 10px", background:"transparent", border:"none", color:"#d0d0e8", fontSize:12, fontWeight:600, cursor:"pointer", textAlign:"left" as const },
  badge:   { fontSize:10, color:"#00d9ff", background:"rgba(0,217,255,0.1)", padding:"2px 7px", borderRadius:4, fontFamily:"monospace" },
  cardBody:{ padding:"8px 10px", borderTop:"1px solid rgba(0,217,255,0.06)", background:"rgba(0,0,0,0.1)" },
  sliderRow:{ display:"flex", alignItems:"center", gap:8, marginBottom:6 },
  sliderLabel: { fontSize:11, color:"#707084", minWidth:54 },
  slider:  { flex:1, accentColor:"#00d9ff" },
  sliderVal:{ fontSize:11, color:"#00d9ff", minWidth:24, textAlign:"right" as const, fontFamily:"monospace" },
  removeBtn:{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", color:"rgba(239,68,68,0.8)", fontSize:11, padding:"3px 8px", borderRadius:4, cursor:"pointer", marginTop:4 },
  footer:  { display:"flex", gap:8, padding:"10px 12px", borderTop:"1px solid rgba(0,217,255,0.07)" },
  cancelBtn:{ flex:1, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", color:"#d0d0e8", fontSize:12, fontWeight:600, padding:"8px", borderRadius:6, cursor:"pointer" },
  buyBtn:  { flex:2, background:"rgba(0,217,255,0.12)", border:"1px solid rgba(0,217,255,0.3)", color:"#00d9ff", fontSize:12, fontWeight:700, padding:"8px", borderRadius:6, cursor:"pointer" },
}

export default function App() {
  const { visible, submitting, store, handleBuy, handleCancel } = useClothing()
  if (!visible) return null

  return (
    <div style={S.panel}>
      <div style={S.header}>
        <h2 style={S.title}>👔 Boutique Vêtements</h2>
        <button style={S.closeBtn} onClick={handleCancel}>✕</button>
      </div>

      <div style={S.body}>
        <section style={S.section}>
          <span style={S.sectionLabel}>Vêtements</span>
          {COMPONENT_DEFS.map((def) => {
            const comp     = store.components[def.id] ?? { drawable:0, texture:0, palette:0 }
            const isActive = store.activeCategory === def.id
            return (
              <div key={def.id} style={S.card}>
                <button style={S.cardHeader} onClick={() => store.setActiveCategory(isActive ? null : def.id)}>
                  <span>{def.icon} {def.name}</span>
                  <span style={S.badge}>{comp.drawable}/{comp.texture}</span>
                </button>
                {isActive && (
                  <div style={S.cardBody}>
                    <div style={S.sliderRow}>
                      <span style={S.sliderLabel}>Modèle</span>
                      <input style={S.slider} type="range" min={0} max={128} value={comp.drawable}
                        onChange={(e) => store.updateComponent(def.id, { drawable: Number(e.target.value) })} />
                      <span style={S.sliderVal}>{comp.drawable}</span>
                    </div>
                    <div style={S.sliderRow}>
                      <span style={S.sliderLabel}>Texture</span>
                      <input style={S.slider} type="range" min={0} max={16} value={comp.texture}
                        onChange={(e) => store.updateComponent(def.id, { texture: Number(e.target.value) })} />
                      <span style={S.sliderVal}>{comp.texture}</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </section>

        <section style={S.section}>
          <span style={S.sectionLabel}>Accessoires</span>
          {PROP_DEFS.map((def) => {
            const prop     = store.props[def.anchor] ?? { propIndex:-1, propTextureIndex:0 }
            const isActive = store.activeCategory === (def.anchor + 100)
            const hasItem  = prop.propIndex >= 0
            return (
              <div key={def.anchor} style={S.card}>
                <button style={S.cardHeader} onClick={() => store.setActiveCategory(isActive ? null : def.anchor + 100)}>
                  <span>{def.icon} {def.name}</span>
                  <span style={S.badge}>{hasItem ? `${prop.propIndex}/${prop.propTextureIndex}` : "Aucun"}</span>
                </button>
                {isActive && (
                  <div style={S.cardBody}>
                    <div style={S.sliderRow}>
                      <span style={S.sliderLabel}>Modèle</span>
                      <input style={S.slider} type="range" min={0} max={64} value={Math.max(0, prop.propIndex)}
                        onChange={(e) => store.updateProp(def.anchor, { propIndex: Number(e.target.value) })} />
                      <span style={S.sliderVal}>{Math.max(0, prop.propIndex)}</span>
                    </div>
                    <div style={S.sliderRow}>
                      <span style={S.sliderLabel}>Texture</span>
                      <input style={S.slider} type="range" min={0} max={16} value={prop.propTextureIndex}
                        onChange={(e) => store.updateProp(def.anchor, { propTextureIndex: Number(e.target.value) })} />
                      <span style={S.sliderVal}>{prop.propTextureIndex}</span>
                    </div>
                    {hasItem && (
                      <button style={S.removeBtn} onClick={() => store.updateProp(def.anchor, { propIndex: -1 })}>
                        ✕ Retirer
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </section>
      </div>

      <div style={S.footer}>
        <button style={S.cancelBtn} onClick={handleCancel} disabled={submitting}>← Annuler</button>
        <button style={S.buyBtn}    onClick={handleBuy}    disabled={submitting}>
          {submitting ? "⏳ Achat..." : "✓ Acheter"}
        </button>
      </div>
    </div>
  )
}
