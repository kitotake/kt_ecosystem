// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KT_BARBER — APP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { useBarber } from "./hooks/useBarber"
import { HAIR_COLORS, MAX_HAIR_STYLE } from "./types/barber.types"
import "./styles/global.scss"

const S = {
  panel:    { position:"fixed" as const, left:24, top:24, width:320, maxHeight:"calc(100vh - 48px)", background:"#16161f", border:"1px solid rgba(0,217,255,0.12)", borderRadius:12, display:"flex", flexDirection:"column" as const, overflow:"hidden", boxShadow:"0 24px 64px rgba(0,0,0,0.7)" },
  header:   { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", borderBottom:"1px solid rgba(0,217,255,0.08)" },
  title:    { fontSize:16, fontWeight:700, color:"#f8f8ff", margin:0 },
  closeBtn: { background:"transparent", border:"none", color:"#707084", fontSize:18, cursor:"pointer", padding:"2px 6px" },
  body:     { flex:1, overflowY:"auto" as const, padding:"12px 14px", display:"flex", flexDirection:"column" as const, gap:16 },
  section:  { display:"flex", flexDirection:"column" as const, gap:10 },
  label:    { fontSize:10, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase" as const, color:"#707084" },
  sliderRow:{ display:"flex", alignItems:"center", gap:8 },
  sliderLabel:{ fontSize:12, color:"#d0d0e8", minWidth:60 },
  slider:   { flex:1, accentColor:"#00d9ff" },
  sliderVal:{ fontSize:12, color:"#00d9ff", minWidth:28, textAlign:"right" as const, fontFamily:"monospace" },
  colorGrid:{ display:"grid", gridTemplateColumns:"repeat(10, 1fr)", gap:4 },
  swatch:   (color: string, selected: boolean): React.CSSProperties => ({
    width:"100%", aspectRatio:"1", borderRadius:4, cursor:"pointer",
    backgroundColor: color,
    border: selected ? "2px solid #00d9ff" : "2px solid transparent",
    transform: selected ? "scale(1.2)" : "none",
    boxShadow: selected ? "0 0 0 2px rgba(0,217,255,0.4)" : "none",
    transition: "0.2s",
  }),
  previewRow: { display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:"rgba(0,217,255,0.04)", borderRadius:8, border:"1px solid rgba(0,217,255,0.1)" },
  previewDot: (color: string): React.CSSProperties => ({ width:32, height:32, borderRadius:"50%", backgroundColor: color, border:"2px solid rgba(0,217,255,0.3)", flexShrink:0 }),
  previewInfo:{ fontSize:12, color:"#d0d0e8" },
  previewSub: { fontSize:11, color:"#707084", fontFamily:"monospace" },
  footer:   { display:"flex", gap:8, padding:"10px 12px", borderTop:"1px solid rgba(0,217,255,0.07)" },
  cancelBtn:{ flex:1, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", color:"#d0d0e8", fontSize:12, fontWeight:600, padding:"8px", borderRadius:6, cursor:"pointer" },
  saveBtn:  { flex:2, background:"rgba(0,217,255,0.12)", border:"1px solid rgba(0,217,255,0.3)", color:"#00d9ff", fontSize:12, fontWeight:700, padding:"8px", borderRadius:6, cursor:"pointer" },
}

import React from "react"

export default function App() {
  const { visible, submitting, store, handleSave, handleCancel } = useBarber()
  if (!visible) return null

  const hairColor  = HAIR_COLORS[store.hair.color]     ?? "#3d1c00"
  const highlight  = HAIR_COLORS[store.hair.highlight] ?? hairColor

  return (
    <div style={S.panel}>
      <div style={S.header}>
        <h2 style={S.title}>✂️ Barbier</h2>
        <button style={S.closeBtn} onClick={handleCancel}>✕</button>
      </div>

      <div style={S.body}>

        {/* Preview couleur */}
        <div style={S.previewRow}>
          <div style={S.previewDot(hairColor)} />
          <div>
            <div style={S.previewInfo}>Style #{store.hair.style}</div>
            <div style={S.previewSub}>Couleur #{store.hair.color} · Reflet #{store.hair.highlight}</div>
          </div>
          <div style={{ ...S.previewDot(highlight), marginLeft:"auto", width:20, height:20 }} />
        </div>

        {/* Style */}
        <div style={S.section}>
          <span style={S.label}>Coiffure</span>
          <div style={S.sliderRow}>
            <span style={S.sliderLabel}>Style</span>
            <input style={S.slider} type="range" min={0} max={MAX_HAIR_STYLE} value={store.hair.style}
              onChange={(e) => store.setHair({ style: Number(e.target.value) })} />
            <span style={S.sliderVal}>{store.hair.style}</span>
          </div>
        </div>

        {/* Couleur principale */}
        <div style={S.section}>
          <span style={S.label}>Couleur</span>
          <div style={S.colorGrid}>
            {HAIR_COLORS.map((color, i) => (
              <button key={i} style={S.swatch(color, store.hair.color === i)}
                onClick={() => store.setHair({ color: i })}
                title={`Couleur ${i}`} />
            ))}
          </div>
        </div>

        {/* Reflet */}
        <div style={S.section}>
          <span style={S.label}>Reflet</span>
          <div style={S.colorGrid}>
            {HAIR_COLORS.map((color, i) => (
              <button key={i} style={S.swatch(color, store.hair.highlight === i)}
                onClick={() => store.setHair({ highlight: i })}
                title={`Reflet ${i}`} />
            ))}
          </div>
        </div>

      </div>

      <div style={S.footer}>
        <button style={S.cancelBtn} onClick={handleCancel} disabled={submitting}>← Annuler</button>
        <button style={S.saveBtn}   onClick={handleSave}   disabled={submitting}>
          {submitting ? "⏳ Sauvegarde..." : "✓ Confirmer"}
        </button>
      </div>
    </div>
  )
}
