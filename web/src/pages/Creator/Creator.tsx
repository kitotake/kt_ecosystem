// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Creator.tsx — Fixed: Valider sur clothing → handleSubmit
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import styles from "./Creator.module.scss";
import { useCreator, STEPS } from "../../hooks/useCreator";

import Category        from "../../components/Category/Category";
import Field           from "../../components/Field/Field";
import AssetPickerPage from "../AssetPickerPage/AssetPickerPage";

// ─── Boutons caméra ───────────────────────────────────────────────────────
const CAM_BUTTONS = [
  { action: "rotateLeft",  icon: "↺", label: "Gauche", title: "Tourner à gauche" },
  { action: "rotateRight", icon: "↻", label: "Droite", title: "Tourner à droite" },
  { action: "zoomIn",      icon: "⊕", label: "Zoom +", title: "Zoom avant"       },
  { action: "zoomOut",     icon: "⊖", label: "Zoom -", title: "Zoom arrière"     },
  { action: "focusHead",   icon: "◯", label: "Tête",   title: "Focus visage"     },
  { action: "focusBody",   icon: "▭", label: "Corps",  title: "Focus corps"      },
  { action: "focusFull",   icon: "▬", label: "Entier", title: "Vue entière"      },
  { action: "resetCam",    icon: "⌖", label: "Reset",  title: "Réinitialiser"    },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function Creator() {
  const {
    visible, stepIndex, errors, serverError, submitting, currentStep,
    identity,
    closeUI, goToStep, nextStep, prevStep, handleSubmit, camControl, getAge,
    updateIdentity, updateComponents, updateProps,
  } = useCreator();

  if (!visible) return null;

  const ACTIVE_STEPS = STEPS.filter((s) =>
    s.id === "identity" || s.id === "clothing"
  );
  const activeIndex = ACTIVE_STEPS.findIndex((s) => s.id === currentStep.id);
  const isClothingStep = currentStep.id === "clothing";

  return (
    <>
      {/* ── Panneau caméra ─────────────────────────────────────────────── */}
      <div className={styles.camPanel}>
        <span className={styles.camTitle}>CAMÉRA</span>
        {CAM_BUTTONS.map((btn) => (
          <button
            key={btn.action}
            className={styles.camBtn}
            title={btn.title}
            onClick={() => camControl(btn.action)}
          >
            <span className={styles.camIcon}>{btn.icon}</span>
            <span className={styles.camLabel}>{btn.label}</span>
          </button>
        ))}
      </div>

      {/* ── Panneau principal ───────────────────────────────────────────── */}
      <div className={styles.container}>

        {/* Step progress bar */}
        <div className={styles.stepBar}>
          {ACTIVE_STEPS.map((s, i) => (
            <button
              key={s.id}
              className={[
                styles.stepDot,
                s.id === currentStep.id ? styles.stepActive : "",
                i < activeIndex         ? styles.stepDone   : "",
              ].join(" ")}
              onClick={() => i < activeIndex && goToStep(STEPS.findIndex((x) => x.id === s.id))}
              title={s.label}
            >
              <span className={styles.stepDotIcon}>{i < activeIndex ? "✓" : s.icon}</span>
              <span className={styles.stepDotLabel}>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Step header */}
        <div className={styles.stepHeader}>
          <span className={styles.stepNum}>{activeIndex + 1} / {ACTIVE_STEPS.length}</span>
          <h2 className={styles.stepTitle}>
            <span>{currentStep.icon}</span> {currentStep.label}
          </h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={() => void closeUI()}
            disabled={submitting}
            title="Fermer"
          >
            ×
          </button>
        </div>

        {/* Messages erreur serveur */}
        {serverError && <div className={styles.error}>{serverError}</div>}

        {/* ── Contenu ─────────────────────────────────────────────────── */}
        <div className={styles.stepContent}>

          {/* IDENTITÉ */}
          {currentStep.id === "identity" && (
            <>
              <Category title="État civil" icon="👤">
                <Field
                  label="Prénom" type="text" value={identity.firstname}
                  onChange={(v) => updateIdentity("firstname", v)}
                  placeholder="ex: Jean" required error={errors.firstname}
                />
                <Field
                  label="Nom" type="text" value={identity.lastname}
                  onChange={(v) => updateIdentity("lastname", v)}
                  placeholder="ex: Dupont" required error={errors.lastname}
                />
                <Field
                  label={`Date de naissance${getAge() ? ` (${getAge()} ans)` : ""}`}
                  type="date" value={identity.dateofbirth}
                  onChange={(v) => updateIdentity("dateofbirth", v)}
                  required error={errors.dateofbirth}
                />
              </Category>

              <Category title="Genre" icon="⚧">
                <div className={styles.genderRow}>
                  <button
                    className={[
                      styles.genderBtn,
                      identity.gender === "mp_m_freemode_01" ? styles.genderActive : "",
                    ].join(" ")}
                    onClick={() => updateIdentity("gender", "mp_m_freemode_01")}
                  >
                    <span className={styles.genderIcon}>♂</span>
                    <span className={styles.genderLabel}>Masculin</span>
                    <span className={styles.genderSub}>mp_m</span>
                  </button>
                  <button
                    className={[
                      styles.genderBtn,
                      identity.gender === "mp_f_freemode_01" ? styles.genderActive : "",
                    ].join(" ")}
                    onClick={() => updateIdentity("gender", "mp_f_freemode_01")}
                  >
                    <span className={styles.genderIcon}>♀</span>
                    <span className={styles.genderLabel}>Féminin</span>
                    <span className={styles.genderSub}>mp_f</span>
                  </button>
                </div>
              </Category>
            </>
          )}

          {/* TENUE — AssetPicker visuel
              onValidate : sauvegarde les données ET crée le personnage  */}
          {currentStep.id === "clothing" && (
            <AssetPickerPage
              gender={identity.gender}
              onPreview={(comps, prps) => {
                updateComponents(comps);
                updateProps(prps);
              }}
              onValidate={(comps, prps) => {
                updateComponents(comps);
                updateProps(prps);
                // On submit directement depuis le bouton "Valider la tenue"
                void handleSubmit();
              }}
            />
          )}

        </div>

        {/* ── Navigation ──────────────────────────────────────────────── */}
        <div className={styles.navRow}>

          <button
            className={styles.navBtn}
            onClick={prevStep}
            disabled={stepIndex === 0 || submitting}
          >
            ← Retour
          </button>

          {/* Sur identity : bouton Suivant */}
          {currentStep.id === "identity" && (
            <button className={styles.navBtnNext} onClick={nextStep}>
              Suivant →
            </button>
          )}

          {/* Sur clothing : le bouton Valider est DANS AssetPicker,
              mais on ajoute aussi un bouton de secours ici */}
          {isClothingStep && (
            <button
              className={styles.submitBtn}
              onClick={() => void handleSubmit()}
              disabled={submitting}
            >
              {submitting ? "⏳ Création..." : "✓ Créer le personnage"}
            </button>
          )}

        </div>

      </div>
    </>
  );
}