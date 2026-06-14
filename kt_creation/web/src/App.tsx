// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KT_CREATION — APP
// Wizard : Identité → Apparence → Style → Tenue
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import React from "react"
import { useCreator, STEPS } from "./hooks/useCreator"
import { useIdentityStore }   from "./store/identity.store"
import { useAppearanceStore } from "./store/appearance.store"
import { cameraAction, tabChange } from "./bridge"
import "./styles/global.scss"

// ── Styles inline (même système que les autres ressources) ────────────────
const S = {
  panel:     { position:"fixed" as const, left:24, top:24, width:380, maxHeight:"calc(100vh - 48px)", background:"#16161f", border:"1px solid rgba(0,217,255,0.12)", borderRadius:12, display:"flex", flexDirection:"column" as const, overflow:"hidden", boxShadow:"0 24px 64px rgba(0,0,0,0.7)" },
  stepBar:   { display:"flex", alignItems:"center", justifyContent:"center", gap:32, padding:"12px 16px 8px", borderBottom:"1px solid rgba(0,217,255,0.07)", flexShrink:0 },
  stepDot:   (active: boolean, done: boolean): React.CSSProperties => ({ display:"flex", flexDirection:"column", alignItems:"center", gap:4, cursor: done ? "pointer" : "default", background:"transparent", border:"none", padding:0 }),
  dotIcon:   (active: boolean, done: boolean): React.CSSProperties => ({ width:26, height:26, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, background: active ? "#00d9ff" : done ? "rgba(0,217,255,0.1)" : "rgba(255,255,255,0.04)", border: active ? "none" : done ? "1px solid rgba(0,217,255,0.25)" : "1px solid rgba(0,217,255,0.1)", color: active ? "#000" : done ? "#00d9ff" : "#707084", fontWeight: active ? 700 : 400 }),
  dotLabel:  (active: boolean): React.CSSProperties => ({ fontSize:8, letterSpacing:"0.08em", textTransform:"uppercase" as const, color: active ? "#00d9ff" : "#707084" }),
  stepHeader:{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 16px 8px", flexShrink:0 },
  stepNum:   { fontSize:11, fontFamily:"monospace", color:"rgba(0,217,255,0.35)", letterSpacing:"0.1em" },
  stepTitle: { fontSize:15, fontWeight:700, color:"#f8f8ff", display:"flex", alignItems:"center", gap:6, margin:0 },
  closeBtn:  { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", color:"#d0d0e8", fontSize:16, width:28, height:28, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" },
  errorMsg:  { margin:"0 14px 4px", padding:"7px 12px", borderRadius:6, fontSize:12, fontWeight:600, background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.28)", color:"#ff8080", flexShrink:0 },
  body:      { flex:1, overflowY:"auto" as const, padding:"8px 14px 10px" },
  footer:    { display:"flex", gap:8, padding:"10px 14px", borderTop:"1px solid rgba(0,217,255,0.07)", flexShrink:0 },
  backBtn:   { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", color:"#d0d0e8", fontSize:12, fontWeight:600, padding:"8px 14px", borderRadius:6, cursor:"pointer" },
  nextBtn:   { flex:1, background:"rgba(0,217,255,0.12)", border:"1px solid rgba(0,217,255,0.3)", color:"#00d9ff", fontSize:12, fontWeight:700, padding:"8px", borderRadius:6, cursor:"pointer" },
  submitBtn: { flex:1, background:"linear-gradient(135deg, #00d9ff, #40ffff)", border:"none", color:"#000", fontSize:12, fontWeight:700, padding:"8px", borderRadius:6, cursor:"pointer", letterSpacing:"0.06em", textTransform:"uppercase" as const },
  // Fields
  fieldWrap: { display:"flex", flexDirection:"column" as const, gap:5, marginBottom:12 },
  fieldLabel:{ fontSize:11, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase" as const, color:"#707084" },
  required:  { color:"#ef4444", marginLeft:4 },
  input:     { width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(0,217,255,0.15)", color:"#f8f8ff", borderRadius:8, padding:"8px 12px", fontSize:13, outline:"none" },
  errText:   { fontSize:11, color:"#ef4444", fontWeight:600 },
  // Gender
  genderRow: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 },
  genderBtn: (active: boolean): React.CSSProperties => ({ display:"flex", flexDirection:"column", alignItems:"center", gap:5, padding:"12px 8px", background: active ? "rgba(0,217,255,0.12)" : "rgba(255,255,255,0.03)", border: active ? "1.5px solid #00d9ff" : "1.5px solid rgba(0,217,255,0.12)", borderRadius:8, cursor:"pointer", transition:"0.2s" }),
  genderIcon:{ fontSize:24, color:"#00d9ff" },
  genderName:{ fontSize:13, fontWeight:700, color:"#f8f8ff" },
  genderSub: { fontSize:10, color:"#707084", fontFamily:"monospace" },
  // Sliders
  sliderRow: { display:"flex", alignItems:"center", gap:8, marginBottom:8 },
  sliderLabel:{ fontSize:12, color:"#d0d0e8", minWidth:90 },
  slider:    { flex:1, accentColor:"#00d9ff" },
  sliderVal: { fontSize:12, color:"#00d9ff", minWidth:30, textAlign:"right" as const, fontFamily:"monospace" },
  // Section
  secLabel:  { display:"block", fontSize:10, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase" as const, color:"#707084", padding:"10px 0 6px", borderBottom:"1px solid rgba(0,217,255,0.06)", marginBottom:8 },
  // Camera bar
  camPanel:  { position:"fixed" as const, right:24, top:"50%", transform:"translateY(-50%)", width:80, background:"rgba(10,10,18,0.92)", border:"1px solid rgba(0,217,255,0.14)", borderRadius:8, padding:"8px 5px", display:"flex", flexDirection:"column" as const, gap:4, boxShadow:"0 8px 32px rgba(0,0,0,0.6)" },
  camTitle:  { fontSize:8, fontWeight:700, letterSpacing:"0.18em", textTransform:"uppercase" as const, color:"rgba(0,217,255,0.4)", textAlign:"center" as const, paddingBottom:5, borderBottom:"1px solid rgba(0,217,255,0.08)", marginBottom:2 },
  camBtn:    { display:"flex", flexDirection:"column" as const, alignItems:"center", gap:2, padding:"5px 2px", background:"rgba(255,255,255,0.025)", border:"1px solid rgba(0,217,255,0.08)", borderRadius:5, cursor:"pointer", width:"100%" },
  camIcon:   { fontSize:15, color:"#00d9ff" },
  camLabel:  { fontSize:7, color:"#707084", fontWeight:600, letterSpacing:"0.04em" },
}

const CAM_BUTTONS = [
  { action:"rotateLeft",  icon:"↺", label:"Gauche"  },
  { action:"rotateRight", icon:"↻", label:"Droite"  },
  { action:"zoomIn",      icon:"⊕", label:"Zoom +"  },
  { action:"zoomOut",     icon:"⊖", label:"Zoom -"  },
  { action:"focusHead",   icon:"◯", label:"Tête"    },
  { action:"focusBody",   icon:"▭", label:"Corps"   },
  { action:"focusFull",   icon:"▬", label:"Entier"  },
  { action:"resetCam",    icon:"⌖", label:"Reset"   },
] as const

// ── Steps content ─────────────────────────────────────────────────────────

function StepIdentity() {
  const identity = useIdentityStore()
  const age = identity.getAge()

  return (
    <>
      <span style={S.secLabel}>État civil</span>

      <div style={S.fieldWrap}>
        <label style={S.fieldLabel}>Prénom<span style={S.required}>*</span></label>
        <input style={{ ...S.input, borderColor: identity.errors.firstname ? "rgba(239,68,68,0.5)" : undefined }}
          type="text" placeholder="ex: Jean" value={identity.data.firstname}
          onChange={(e) => identity.setField("firstname", e.target.value)} />
        {identity.errors.firstname && <span style={S.errText}>{identity.errors.firstname}</span>}
      </div>

      <div style={S.fieldWrap}>
        <label style={S.fieldLabel}>Nom<span style={S.required}>*</span></label>
        <input style={{ ...S.input, borderColor: identity.errors.lastname ? "rgba(239,68,68,0.5)" : undefined }}
          type="text" placeholder="ex: Dupont" value={identity.data.lastname}
          onChange={(e) => identity.setField("lastname", e.target.value)} />
        {identity.errors.lastname && <span style={S.errText}>{identity.errors.lastname}</span>}
      </div>

      <div style={S.fieldWrap}>
        <label style={S.fieldLabel}>
          Date de naissance<span style={S.required}>*</span>
          {age !== null && <span style={{ color:"#00d9ff", marginLeft:8, fontWeight:400 }}>({age} ans)</span>}
        </label>
        <input style={{ ...S.input, borderColor: identity.errors.dateofbirth ? "rgba(239,68,68,0.5)" : undefined }}
          type="date" value={identity.data.dateofbirth}
          onChange={(e) => identity.setField("dateofbirth", e.target.value)} />
        {identity.errors.dateofbirth && <span style={S.errText}>{identity.errors.dateofbirth}</span>}
      </div>

      <span style={S.secLabel}>Genre</span>
      <div style={S.genderRow}>
        <button style={S.genderBtn(identity.data.gender === "mp_m_freemode_01")}
          onClick={() => identity.setField("gender", "mp_m_freemode_01")}>
          <span style={S.genderIcon}>♂</span>
          <span style={S.genderName}>Masculin</span>
          <span style={S.genderSub}>mp_m</span>
        </button>
        <button style={S.genderBtn(identity.data.gender === "mp_f_freemode_01")}
          onClick={() => identity.setField("gender", "mp_f_freemode_01")}>
          <span style={S.genderIcon}>♀</span>
          <span style={S.genderName}>Féminin</span>
          <span style={S.genderSub}>mp_f</span>
        </button>
      </div>
    </>
  )
}

function StepAppearance() {
  const app = useAppearanceStore()

  return (
    <>
      <span style={S.secLabel}>Parents</span>
      {[
        { key:"shapeFirst",  label:"Père",        max:45 },
        { key:"shapeSecond", label:"Mère",        max:45 },
        { key:"skinFirst",   label:"Teint père",  max:45 },
        { key:"skinSecond",  label:"Teint mère",  max:45 },
      ].map(({ key, label, max }) => (
        <div key={key} style={S.sliderRow}>
          <span style={S.sliderLabel}>{label}</span>
          <input style={S.slider} type="range" min={0} max={max}
            value={(app.headBlend as Record<string, number>)[key] ?? 0}
            onChange={(e) => app.setHeadBlend({ ...app.headBlend, [key]: Number(e.target.value) })} />
          <span style={S.sliderVal}>{(app.headBlend as Record<string, number>)[key] ?? 0}</span>
        </div>
      ))}
      <div style={S.sliderRow}>
        <span style={S.sliderLabel}>Forme</span>
        <input style={S.slider} type="range" min={0} max={100}
          value={Math.round(app.headBlend.shapeMix * 100)}
          onChange={(e) => app.setHeadBlend({ ...app.headBlend, shapeMix: Number(e.target.value) / 100 })} />
        <span style={S.sliderVal}>{Math.round(app.headBlend.shapeMix * 100)}%</span>
      </div>
      <div style={S.sliderRow}>
        <span style={S.sliderLabel}>Teint mix</span>
        <input style={S.slider} type="range" min={0} max={100}
          value={Math.round(app.headBlend.skinMix * 100)}
          onChange={(e) => app.setHeadBlend({ ...app.headBlend, skinMix: Number(e.target.value) / 100 })} />
        <span style={S.sliderVal}>{Math.round(app.headBlend.skinMix * 100)}%</span>
      </div>

      <span style={S.secLabel}>Traits du visage</span>
      {Array.from({ length: 20 }, (_, i) => (
        <div key={i} style={S.sliderRow}>
          <span style={{ ...S.sliderLabel, fontSize:10 }}>Feature {i}</span>
          <input style={S.slider} type="range" min={-100} max={100}
            value={Math.round((app.faceFeatures[i] ?? 0) * 100)}
            onChange={(e) => {
              const next = [...app.faceFeatures]
              next[i] = Number(e.target.value) / 100
              app.setFaceFeatures(next)
            }} />
          <span style={S.sliderVal}>{Math.round((app.faceFeatures[i] ?? 0) * 100)}</span>
        </div>
      ))}
    </>
  )
}

function StepStyle() {
  const app = useAppearanceStore()

  const HAIR_COLORS = [
    "#1a0a00","#2c1300","#3d1c00","#4e2500","#5c2e00","#6b3800","#7a4200","#8a4e00",
    "#9a5a00","#aa6600","#ba7200","#ca7e00","#da8a00","#e8960a","#f0a020","#f5b040",
    "#f8c060","#fad080","#fde0a0","#fff0c0","#c8a060","#b89050","#a88040","#987030",
    "#886020","#785010","#684008","#583205","#3c1e02","#200800","#c0c0c0","#a8a8a8",
    "#909090","#787878","#606060","#484848","#303030","#181818","#080808","#000000",
    "#ff4040","#e03030","#c02020","#a01010","#800000","#ff8040","#e06020","#c04010",
    "#a02808","#801800","#40a040","#208020","#106010","#004000","#002800","#4080ff",
    "#2060e0","#1040c0","#0820a0","#000080","#c040ff","#a020e0","#8010c0","#6008a0","#400080",
  ]
  const colorGrid = { display:"grid", gridTemplateColumns:"repeat(10, 1fr)", gap:3, marginBottom:10 } as const
  const swatch = (color: string, selected: boolean): React.CSSProperties => ({
    width:"100%", aspectRatio:"1", borderRadius:3, cursor:"pointer", backgroundColor:color,
    border: selected ? "2px solid #00d9ff" : "2px solid transparent",
    transform: selected ? "scale(1.2)" : "none",
  })

  return (
    <>
      <span style={S.secLabel}>Coiffure</span>
      <div style={S.sliderRow}>
        <span style={S.sliderLabel}>Style</span>
        <input style={S.slider} type="range" min={0} max={75} value={app.hair.style}
          onChange={(e) => app.setHair({ style: Number(e.target.value) })} />
        <span style={S.sliderVal}>{app.hair.style}</span>
      </div>

      <span style={{ ...S.secLabel, paddingTop:4 }}>Couleur cheveux</span>
      <div style={colorGrid}>
        {HAIR_COLORS.map((c, i) => (
          <button key={i} style={swatch(c, app.hair.color === i)}
            onClick={() => app.setHair({ color: i })} title={`Couleur ${i}`} />
        ))}
      </div>

      <span style={{ ...S.secLabel, paddingTop:4 }}>Reflet</span>
      <div style={colorGrid}>
        {HAIR_COLORS.map((c, i) => (
          <button key={i} style={swatch(c, app.hair.highlight === i)}
            onClick={() => app.setHair({ highlight: i })} title={`Reflet ${i}`} />
        ))}
      </div>
    </>
  )
}

function StepClothing() {
  const app = useAppearanceStore()
  const COMP_DEFS = [
    { id:11, name:"Veste",   icon:"🧥" }, { id:3,  name:"Haut",    icon:"👔" },
    { id:4,  name:"Bas",     icon:"👖" }, { id:6,  name:"Chaussures", icon:"👟" },
    { id:8,  name:"Dessous", icon:"👕" }, { id:9,  name:"Gilet",   icon:"🦺" },
  ]

  return (
    <>
      <span style={S.secLabel}>Tenue initiale</span>
      {COMP_DEFS.map((def) => {
        const comp = (app.components as Record<number, { drawable:number; texture:number; palette:number }>)[def.id] ?? { drawable:0, texture:0, palette:0 }
        return (
          <div key={def.id} style={{ marginBottom:10 }}>
            <span style={{ ...S.sliderLabel, display:"block", marginBottom:4 }}>{def.icon} {def.name}</span>
            <div style={S.sliderRow}>
              <span style={{ fontSize:10, color:"#707084", minWidth:48 }}>Modèle</span>
              <input style={S.slider} type="range" min={0} max={128} value={comp.drawable}
                onChange={(e) => {
                  const next = { ...(app.components as Record<number, object>), [def.id]: { ...comp, drawable: Number(e.target.value) } }
                  app.setComponents(next as typeof app.components)
                }} />
              <span style={S.sliderVal}>{comp.drawable}</span>
            </div>
            <div style={S.sliderRow}>
              <span style={{ fontSize:10, color:"#707084", minWidth:48 }}>Texture</span>
              <input style={S.slider} type="range" min={0} max={16} value={comp.texture}
                onChange={(e) => {
                  const next = { ...(app.components as Record<number, object>), [def.id]: { ...comp, texture: Number(e.target.value) } }
                  app.setComponents(next as typeof app.components)
                }} />
              <span style={S.sliderVal}>{comp.texture}</span>
            </div>
          </div>
        )
      })}
    </>
  )
}

// ── App principal ─────────────────────────────────────────────────────────

export default function App() {
  const creator = useCreator()
  if (!creator.visible) return null

  const ACTIVE_STEPS = STEPS.slice(0, 4)
  const activeIndex  = ACTIVE_STEPS.findIndex((s) => s.id === creator.currentStep.id)

  const handleTabChange = async (tab: string) => {
    await tabChange(tab)
  }

  React.useEffect(() => {
    void handleTabChange(creator.currentStep.id)
  }, [creator.currentStep.id]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {/* Barre caméra */}
      <div style={S.camPanel}>
        <span style={S.camTitle}>CAM</span>
        {CAM_BUTTONS.map((btn) => (
          <button key={btn.action} style={S.camBtn} onClick={() => cameraAction(btn.action)}>
            <span style={S.camIcon}>{btn.icon}</span>
            <span style={S.camLabel}>{btn.label}</span>
          </button>
        ))}
      </div>

      {/* Panneau principal */}
      <div style={S.panel}>

        {/* Barre de progression */}
        <div style={S.stepBar}>
          {ACTIVE_STEPS.map((step, i) => {
            const isActive = step.id === creator.currentStep.id
            const isDone   = i < activeIndex
            return (
              <button key={step.id} style={S.stepDot(isActive, isDone)}
                onClick={() => isDone && creator.goToStep(STEPS.findIndex((s) => s.id === step.id))}>
                <span style={S.dotIcon(isActive, isDone)}>
                  {isDone ? "✓" : step.icon}
                </span>
                <span style={S.dotLabel(isActive)}>{step.label}</span>
              </button>
            )
          })}
        </div>

        {/* Header */}
        <div style={S.stepHeader}>
          <span style={S.stepNum}>{activeIndex + 1}/{ACTIVE_STEPS.length}</span>
          <h2 style={S.stepTitle}>{creator.currentStep.icon} {creator.currentStep.label}</h2>
          <button style={S.closeBtn} onClick={() => void creator.handleClose()} disabled={creator.submitting}>×</button>
        </div>

        {/* Erreur */}
        {creator.serverError && <div style={S.errorMsg}>{creator.serverError}</div>}

        {/* Contenu */}
        <div style={S.body}>
          {creator.currentStep.id === "identity"   && <StepIdentity />}
          {creator.currentStep.id === "appearance" && <StepAppearance />}
          {creator.currentStep.id === "style"      && <StepStyle />}
          {creator.currentStep.id === "clothing"   && <StepClothing />}
        </div>

        {/* Navigation */}
        <div style={S.footer}>
          <button style={S.backBtn} onClick={creator.prevStep}
            disabled={creator.stepIndex === 0 || creator.submitting}>
            ← Retour
          </button>
          {!creator.isLastStep ? (
            <button style={S.nextBtn} onClick={creator.nextStep}>
              Suivant →
            </button>
          ) : (
            <button style={S.submitBtn} onClick={() => void creator.handleSubmit()} disabled={creator.submitting}>
              {creator.submitting ? "⏳ Création..." : "✓ Créer le personnage"}
            </button>
          )}
        </div>

      </div>
    </>
  )
}
