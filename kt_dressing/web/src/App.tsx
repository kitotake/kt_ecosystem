// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KT_DRESSING — APP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { useDressing } from "./hooks/useDressing"
import type { Outfit } from "./bridge"
import "./styles/global.scss"

const S = {
  panel:      { position:"fixed" as const, left:24, top:24, width:360, maxHeight:"calc(100vh - 48px)", background:"#16161f", border:"1px solid rgba(0,217,255,0.12)", borderRadius:12, display:"flex", flexDirection:"column" as const, overflow:"hidden", boxShadow:"0 24px 64px rgba(0,0,0,0.7)" },
  header:     { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", borderBottom:"1px solid rgba(0,217,255,0.08)" },
  title:      { fontSize:16, fontWeight:700, color:"#f8f8ff", margin:0 },
  closeBtn:   { background:"transparent", border:"none", color:"#707084", fontSize:18, cursor:"pointer", padding:"2px 6px" },
  body:       { flex:1, overflowY:"auto" as const, padding:"10px 12px", display:"flex", flexDirection:"column" as const, gap:8 },
  sectionLabel: { fontSize:10, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase" as const, color:"#707084", display:"block", padding:"4px 0 2px" },
  emptyState: { textAlign:"center" as const, padding:"24px", color:"#707084", fontSize:12, fontStyle:"italic" },
  outfitItem: (selected: boolean): React.CSSProperties => ({ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 11px", background: selected ? "rgba(0,217,255,0.08)" : "rgba(255,255,255,0.02)", border: selected ? "1px solid rgba(0,217,255,0.4)" : "1px solid rgba(0,217,255,0.07)", borderRadius:8, cursor:"pointer", transition:"0.2s", gap:8 }),
  outfitName: { fontSize:12, fontWeight:600, color:"#f8f8ff", flex:1 },
  outfitActions: { display:"flex", gap:4 },
  wearBtn:    { background:"rgba(0,217,255,0.1)", border:"1px solid rgba(0,217,255,0.2)", color:"#00d9ff", fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:4, cursor:"pointer" },
  delBtn:     { background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.15)", color:"rgba(239,68,68,0.7)", fontSize:10, padding:"3px 6px", borderRadius:4, cursor:"pointer" },
  saveSection:{ display:"flex", flexDirection:"column" as const, gap:6, padding:"10px 0", borderTop:"1px solid rgba(0,217,255,0.07)" },
  saveRow:    { display:"flex", gap:6 },
  saveInput:  { flex:1, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(0,217,255,0.15)", color:"#f8f8ff", borderRadius:6, padding:"7px 10px", fontSize:12, outline:"none" },
  saveBtn:    { background:"rgba(0,217,255,0.12)", border:"1px solid rgba(0,217,255,0.3)", color:"#00d9ff", fontSize:12, fontWeight:700, padding:"7px 14px", borderRadius:6, cursor:"pointer" },
  footer:     { padding:"10px 12px", borderTop:"1px solid rgba(0,217,255,0.07)" },
  closeFooterBtn: { width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", color:"#d0d0e8", fontSize:12, fontWeight:600, padding:"8px", borderRadius:6, cursor:"pointer" },
}

import React from "react"

export default function App() {
  const {
    visible, submitting, store,
    handleWear, handleSave, handleDelete, handleClose,
  } = useDressing()

  if (!visible) return null

  return (
    <div style={S.panel}>
      <div style={S.header}>
        <h2 style={S.title}>👗 Dressing</h2>
        <button style={S.closeBtn} onClick={handleClose}>✕</button>
      </div>

      <div style={S.body}>

        {/* Liste des tenues */}
        <span style={S.sectionLabel}>Mes tenues ({store.outfits.length})</span>

        {store.outfits.length === 0 ? (
          <div style={S.emptyState}>Aucune tenue sauvegardée</div>
        ) : (
          store.outfits.map((outfit: Outfit) => {
            const isSelected = store.selectedOutfit?.id === outfit.id
            return (
              <div key={outfit.id} style={S.outfitItem(isSelected)}
                onClick={() => store.selectOutfit(isSelected ? null : outfit)}>
                <span style={S.outfitName}>{outfit.name}</span>
                <div style={S.outfitActions}>
                  <button style={S.wearBtn}
                    onClick={(e) => { e.stopPropagation(); void handleWear(outfit) }}>
                    ▶ Porter
                  </button>
                  <button style={S.delBtn}
                    onClick={(e) => { e.stopPropagation(); void handleDelete(outfit.id) }}>
                    ✕
                  </button>
                </div>
              </div>
            )
          })
        )}

        {/* Sauvegarder tenue actuelle */}
        <div style={S.saveSection}>
          <span style={S.sectionLabel}>Sauvegarder la tenue actuelle</span>
          <div style={S.saveRow}>
            <input
              style={S.saveInput}
              type="text"
              placeholder="Nom de la tenue..."
              value={store.saveNameInput}
              onChange={(e) => store.setSaveNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && store.saveNameInput.trim()) {
                  void handleSave({}, {})
                }
              }}
            />
            <button
              style={S.saveBtn}
              disabled={!store.saveNameInput.trim() || submitting}
              onClick={() => void handleSave({}, {})}>
              + Sauver
            </button>
          </div>
        </div>
      </div>

      <div style={S.footer}>
        <button style={S.closeFooterBtn} onClick={handleClose}>Fermer</button>
      </div>
    </div>
  )
}
