// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KT_TATTOO — APP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { useTattoo } from "./hooks/useTattoo"
import { ZONE_LABELS, ZONE_ICONS, ZONES, TATTOO_CATALOG } from "./types/tattoo.types"
import type { TattooZone } from "./store/tattoo.store"
import "./styles/global.scss"

const S = {
  panel:      { position:"fixed" as const, left:24, top:24, width:360, maxHeight:"calc(100vh - 48px)", background:"#16161f", border:"1px solid rgba(0,217,255,0.12)", borderRadius:12, display:"flex", flexDirection:"column" as const, overflow:"hidden", boxShadow:"0 24px 64px rgba(0,0,0,0.7)" },
  header:     { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", borderBottom:"1px solid rgba(0,217,255,0.08)" },
  title:      { fontSize:16, fontWeight:700, color:"#f8f8ff", margin:0 },
  closeBtn:   { background:"transparent", border:"none", color:"#707084", fontSize:18, cursor:"pointer", padding:"2px 6px" },
  body:       { flex:1, overflowY:"auto" as const, padding:"10px 12px", display:"flex", flexDirection:"column" as const, gap:10 },
  zones:      { display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:6 },
  zoneBtn:    (active: boolean): React.CSSProperties => ({ display:"flex", flexDirection:"column", alignItems:"center", gap:3, padding:"8px 4px", background: active ? "rgba(0,217,255,0.12)" : "rgba(255,255,255,0.02)", border: active ? "1px solid #00d9ff" : "1px solid rgba(0,217,255,0.08)", borderRadius:8, cursor:"pointer", transition:"0.2s" }),
  zoneIcon:   { fontSize:18 },
  zoneName:   { fontSize:9, fontWeight:700, color:"#d0d0e8", letterSpacing:"0.04em" },
  zoneCount:  { fontSize:9, color:"#00d9ff", fontFamily:"monospace" },
  gridHeader: { display:"flex", alignItems:"center", justifyContent:"space-between" },
  gridLabel:  { fontSize:10, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase" as const, color:"#707084" },
  clearBtn:   { background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", color:"rgba(239,68,68,0.8)", fontSize:10, padding:"3px 8px", borderRadius:4, cursor:"pointer" },
  grid:       { display:"grid", gridTemplateColumns:"1fr 1fr", gap:4, maxHeight:240, overflowY:"auto" as const },
  tatCard:    (applied: boolean): React.CSSProperties => ({ display:"flex", flexDirection:"column", gap:2, padding:"7px 9px", background: applied ? "rgba(0,217,255,0.1)" : "rgba(255,255,255,0.02)", border: applied ? "1px solid #00d9ff" : "1px solid rgba(0,217,255,0.06)", borderRadius:6, cursor:"pointer", textAlign:"left", transition:"0.2s" }),
  tatLabel:   { fontSize:11, fontWeight:600, color:"#f8f8ff" },
  tatColl:    { fontSize:9, color:"#707084", fontFamily:"monospace" },
  appliedSection: { display:"flex", flexDirection:"column" as const, gap:4 },
  appliedTitle:   { fontSize:10, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase" as const, color:"#707084" },
  appliedItem:    { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"5px 8px", background:"rgba(0,217,255,0.06)", border:"1px solid rgba(0,217,255,0.12)", borderRadius:5 },
  appliedLabel:   { fontSize:11, color:"#d0d0e8" },
  appliedDel:     { background:"transparent", border:"none", color:"#707084", fontSize:13, cursor:"pointer" },
  footer:     { display:"flex", gap:8, padding:"10px 12px", borderTop:"1px solid rgba(0,217,255,0.07)" },
  cancelBtn:  { flex:1, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", color:"#d0d0e8", fontSize:12, fontWeight:600, padding:"8px", borderRadius:6, cursor:"pointer" },
  saveBtn:    { flex:2, background:"rgba(0,217,255,0.12)", border:"1px solid rgba(0,217,255,0.3)", color:"#00d9ff", fontSize:12, fontWeight:700, padding:"8px", borderRadius:6, cursor:"pointer" },
}

import React from "react"

export default function App() {
  const { visible, submitting, store, zoneCount, handleSave, handleCancel } = useTattoo()
  if (!visible) return null

  const zoneData = TATTOO_CATALOG.filter((t) => t.zone === store.activeZone)

  return (
    <div style={S.panel}>
      <div style={S.header}>
        <h2 style={S.title}>🖋️ Salon de Tatouage</h2>
        <button style={S.closeBtn} onClick={handleCancel}>✕</button>
      </div>

      <div style={S.body}>

        {/* Sélecteur de zone */}
        <div style={S.zones}>
          {ZONES.map((zone) => {
            const count = zoneCount(zone as TattooZone)
            return (
              <button key={zone} style={S.zoneBtn(store.activeZone === zone)}
                onClick={() => store.setActiveZone(zone as TattooZone)}>
                <span style={S.zoneIcon}>{ZONE_ICONS[zone as TattooZone]}</span>
                <span style={S.zoneName}>{ZONE_LABELS[zone as TattooZone]}</span>
                {count > 0 && <span style={S.zoneCount}>{count}</span>}
              </button>
            )
          })}
        </div>

        {/* Grille tatouages de la zone */}
        <div style={S.gridHeader}>
          <span style={S.gridLabel}>{ZONE_LABELS[store.activeZone]} ({zoneData.length})</span>
          {zoneCount(store.activeZone) > 0 && (
            <button style={S.clearBtn} onClick={() => store.clearZone(store.activeZone)}>
              ✕ Effacer zone
            </button>
          )}
        </div>

        <div style={S.grid}>
          {zoneData.map((tat) => {
            const isApplied = store.applied.some((a) => a.id === tat.id)
            return (
              <button key={tat.id} style={S.tatCard(isApplied)} onClick={() => store.toggleTattoo(tat)}>
                <span style={S.tatLabel}>{tat.label}</span>
                <span style={S.tatColl}>{tat.collection.replace("_overlays", "")}</span>
              </button>
            )
          })}
        </div>

        {/* Liste appliqués */}
        {store.applied.length > 0 && (
          <div style={S.appliedSection}>
            <span style={S.appliedTitle}>Appliqués ({store.applied.length})</span>
            {store.applied.map((tat) => (
              <div key={tat.id} style={S.appliedItem}>
                <span style={S.appliedLabel}>
                  {ZONE_ICONS[tat.zone as TattooZone]} {tat.label}
                </span>
                <button style={S.appliedDel} onClick={() => store.toggleTattoo(tat)}>✕</button>
              </div>
            ))}
          </div>
        )}

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
