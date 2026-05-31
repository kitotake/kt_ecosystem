// web/src/pages/CharacterSelect.tsx
// Sélection de personnage avec previews visuelles SVG inline

import { useState, useEffect, useCallback } from "react";
import styles from "./CharacterSelect.module.scss";

interface Character {
  id: number;
  unique_id: string;
  firstname: string;
  lastname: string;
  dateofbirth: string;
  gender: string;
  model: string;
  job: string;
  job_grade: number;
  health: number;
  armor: number;
}

interface CharacterSelectProps {
  visible: boolean;
  characters: Character[];
  slots: number;
}

function getAge(dateofbirth: string): number {
  const dob = new Date(dateofbirth);
  const diff = Date.now() - dob.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

// ─── Silhouette SVG générée selon genre + job ────────────────────────────
function CharacterSilhouette({
  gender,
  job,
  health,
  selected,
}: {
  gender: string;
  job: string;
  health: number;
  selected: boolean;
}) {
  const isFemale = gender === "f" || gender === "mp_f_freemode_01";

  // Couleurs par job
  const jobColors: Record<string, { primary: string; secondary: string; accent: string }> = {
    police:      { primary: "#1a2a4a", secondary: "#2a4080", accent: "#4a90d9" },
    ambulance:   { primary: "#1a3a2a", secondary: "#1e7a3a", accent: "#4adb7a" },
    mechanic:    { primary: "#2a1a0a", secondary: "#5a3010", accent: "#d97a20" },
    unemployed:  { primary: "#1a1a2a", secondary: "#2a2a3a", accent: "#7a7aaa" },
    default:     { primary: "#1a1a2a", secondary: "#2a2a3a", accent: "#00d9ff" },
  };

  const jobKey = job?.toLowerCase() ?? "default";
  const colors = jobColors[jobKey] ?? jobColors.default;
  const hp = Math.max(0, Math.min(100, ((health - 100) / 100) * 100));
  const hpColor = hp > 60 ? "#10b981" : hp > 30 ? "#f59e0b" : "#ef4444";

  // Skin tone légèrement différente selon genre
  const skinTone = isFemale ? "#e8b99a" : "#d4956e";
  const hairColor = isFemale ? "#3d1c00" : "#1a0a00";

  return (
    <svg
      viewBox="0 0 120 200"
      xmlns="http://www.w3.org/2000/svg"
      className={styles.silhouette}
    >
      <defs>
        <linearGradient id={`bg-${gender}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={colors.primary} />
          <stop offset="100%" stopColor="#0a0a12" />
        </linearGradient>
        <linearGradient id={`body-${gender}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.secondary} />
          <stop offset="100%" stopColor={colors.primary} />
        </linearGradient>
        <radialGradient id={`glow-${gender}`} cx="50%" cy="30%" r="50%">
          <stop offset="0%" stopColor={colors.accent} stopOpacity="0.15" />
          <stop offset="100%" stopColor={colors.accent} stopOpacity="0" />
        </radialGradient>
        <filter id="shadow">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.5" />
        </filter>
        <clipPath id="cardClip">
          <rect width="120" height="200" rx="0" />
        </clipPath>
      </defs>

      {/* Background */}
      <rect width="120" height="200" fill={`url(#bg-${gender})`} />
      <rect width="120" height="200" fill={`url(#glow-${gender})`} />

      {/* Grid lines subtiles */}
      <g opacity="0.06" stroke={colors.accent} strokeWidth="0.5">
        <line x1="0" y1="50" x2="120" y2="50" />
        <line x1="0" y1="100" x2="120" y2="100" />
        <line x1="0" y1="150" x2="120" y2="150" />
        <line x1="40" y1="0" x2="40" y2="200" />
        <line x1="80" y1="0" x2="80" y2="200" />
      </g>

      {/* Ombre au sol */}
      <ellipse cx="60" cy="192" rx="28" ry="5" fill="#000" opacity="0.4" />

      {/* ── JAMBES ── */}
      {isFemale ? (
        <g filter="url(#shadow)">
          {/* Jambes féminines (pantalon slim) */}
          <rect x="43" y="138" width="14" height="45" rx="4" fill={`url(#body-${gender})`} />
          <rect x="63" y="138" width="14" height="45" rx="4" fill={`url(#body-${gender})`} />
          {/* Chaussures */}
          <ellipse cx="50" cy="183" rx="9" ry="4" fill="#111" />
          <ellipse cx="70" cy="183" rx="9" ry="4" fill="#111" />
        </g>
      ) : (
        <g filter="url(#shadow)">
          {/* Jambes masculines */}
          <rect x="40" y="138" width="16" height="47" rx="4" fill={`url(#body-${gender})`} />
          <rect x="64" y="138" width="16" height="47" rx="4" fill={`url(#body-${gender})`} />
          <ellipse cx="48" cy="185" rx="11" ry="4" fill="#111" />
          <ellipse cx="72" cy="185" rx="11" ry="4" fill="#111" />
        </g>
      )}

      {/* ── TORSE ── */}
      {isFemale ? (
        <g filter="url(#shadow)">
          {/* Corps féminin légèrement plus mince */}
          <rect x="38" y="90" width="44" height="52" rx="6" fill={`url(#body-${gender})`} />
          {/* Bras */}
          <rect x="22" y="92" width="14" height="40" rx="5" fill={`url(#body-${gender})`} />
          <rect x="84" y="92" width="14" height="40" rx="5" fill={`url(#body-${gender})`} />
          {/* Mains */}
          <ellipse cx="29" cy="134" rx="7" ry="5" fill={skinTone} />
          <ellipse cx="91" cy="134" rx="7" ry="5" fill={skinTone} />
          {/* Détail vêtement */}
          <line x1="60" y1="92" x2="60" y2="140" stroke={colors.accent} strokeWidth="0.8" opacity="0.4" />
        </g>
      ) : (
        <g filter="url(#shadow)">
          {/* Corps masculin plus large */}
          <rect x="34" y="88" width="52" height="54" rx="6" fill={`url(#body-${gender})`} />
          {/* Épaules prononcées */}
          <rect x="18" y="86" width="16" height="42" rx="5" fill={`url(#body-${gender})`} />
          <rect x="86" y="86" width="16" height="42" rx="5" fill={`url(#body-${gender})`} />
          {/* Mains */}
          <ellipse cx="26" cy="130" rx="8" ry="6" fill={skinTone} />
          <ellipse cx="94" cy="130" rx="8" ry="6" fill={skinTone} />
          {/* Détail vêtement */}
          <line x1="60" y1="90" x2="60" y2="140" stroke={colors.accent} strokeWidth="0.8" opacity="0.4" />
        </g>
      )}

      {/* ── COU ── */}
      <rect
        x={isFemale ? "54" : "52"}
        y="72"
        width={isFemale ? "12" : "16"}
        height="20"
        rx="4"
        fill={skinTone}
        filter="url(#shadow)"
      />

      {/* ── TÊTE ── */}
      {isFemale ? (
        <g filter="url(#shadow)">
          {/* Tête féminine légèrement plus petite */}
          <ellipse cx="60" cy="60" rx="22" ry="26" fill={skinTone} />
          {/* Cheveux */}
          <ellipse cx="60" cy="38" rx="23" ry="14" fill={hairColor} />
          <rect x="37" y="38" width="7" height="22" rx="3" fill={hairColor} />
          <rect x="76" y="38" width="7" height="22" rx="3" fill={hairColor} />
          {/* Visage — yeux */}
          <ellipse cx="53" cy="60" rx="3" ry="3.5" fill="#2a1a0a" />
          <ellipse cx="67" cy="60" rx="3" ry="3.5" fill="#2a1a0a" />
          <ellipse cx="53.5" cy="59" rx="1" ry="1" fill="#fff" opacity="0.6" />
          <ellipse cx="67.5" cy="59" rx="1" ry="1" fill="#fff" opacity="0.6" />
          {/* Sourcils */}
          <path d="M49 54 Q53 52 57 54" stroke="#3d1c00" strokeWidth="1.2" fill="none" />
          <path d="M63 54 Q67 52 71 54" stroke="#3d1c00" strokeWidth="1.2" fill="none" />
          {/* Bouche */}
          <path d="M55 70 Q60 74 65 70" stroke="#c07060" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          {/* Oreilles */}
          <ellipse cx="38" cy="62" rx="3" ry="4" fill={skinTone} />
          <ellipse cx="82" cy="62" rx="3" ry="4" fill={skinTone} />
        </g>
      ) : (
        <g filter="url(#shadow)">
          {/* Tête masculine */}
          <ellipse cx="60" cy="58" rx="24" ry="27" fill={skinTone} />
          {/* Cheveux courts */}
          <ellipse cx="60" cy="35" rx="24" ry="12" fill={hairColor} />
          <rect x="36" y="35" width="5" height="10" rx="2" fill={hairColor} />
          <rect x="79" y="35" width="5" height="10" rx="2" fill={hairColor} />
          {/* Yeux */}
          <ellipse cx="51" cy="57" rx="3.5" ry="3.5" fill="#2a1a0a" />
          <ellipse cx="69" cy="57" rx="3.5" ry="3.5" fill="#2a1a0a" />
          <ellipse cx="51.5" cy="56" rx="1.2" ry="1.2" fill="#fff" opacity="0.6" />
          <ellipse cx="69.5" cy="56" rx="1.2" ry="1.2" fill="#fff" opacity="0.6" />
          {/* Sourcils épais */}
          <path d="M46 50 Q51 48 56 50" stroke="#1a0a00" strokeWidth="2" fill="none" />
          <path d="M64 50 Q69 48 74 50" stroke="#1a0a00" strokeWidth="2" fill="none" />
          {/* Bouche */}
          <path d="M54 70 Q60 73 66 70" stroke="#a06050" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          {/* Oreilles */}
          <ellipse cx="36" cy="60" rx="3.5" ry="5" fill={skinTone} />
          <ellipse cx="84" cy="60" rx="3.5" ry="5" fill={skinTone} />
        </g>
      )}

      {/* ── Badge job ── */}
      {job && job !== "unemployed" && (
        <g>
          <rect x="6" y="6" width="35" height="13" rx="3" fill={colors.accent} opacity="0.9" />
          <text x="23" y="16" fontSize="6" fontFamily="monospace" textAnchor="middle" fill="#000" fontWeight="bold">
            {job.toUpperCase().slice(0, 6)}
          </text>
        </g>
      )}

      {/* ── Barre de vie en bas ── */}
      <rect x="8" y="186" width="104" height="5" rx="2.5" fill="rgba(0,0,0,0.5)" />
      <rect
        x="8"
        y="186"
        width={`${hp * 1.04}`}
        height="5"
        rx="2.5"
        fill={hpColor}
        opacity="0.9"
      />

      {/* ── Sélection glow ── */}
      {selected && (
        <>
          <rect
            width="120"
            height="200"
            fill="none"
            stroke={colors.accent}
            strokeWidth="2.5"
            opacity="0.9"
          />
          <rect
            width="120"
            height="200"
            fill={colors.accent}
            opacity="0.05"
          />
        </>
      )}
    </svg>
  );
}

// ─── Slot vide animé ─────────────────────────────────────────────────────
function EmptySlotSvg() {
  return (
    <svg viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg" className={styles.silhouette}>
      <defs>
        <linearGradient id="emptyBg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#12121a" />
          <stop offset="100%" stopColor="#0a0a10" />
        </linearGradient>
      </defs>
      <rect width="120" height="200" fill="url(#emptyBg)" />
      {/* Silhouette fantôme */}
      <g opacity="0.08" fill="none" stroke="#00d9ff" strokeWidth="1.5" strokeDasharray="4 3">
        {/* Corps fantôme */}
        <ellipse cx="60" cy="58" rx="22" ry="26" />
        <rect x="36" y="88" width="48" height="52" rx="6" />
        <rect x="22" y="90" width="14" height="40" rx="5" />
        <rect x="84" y="90" width="14" height="40" rx="5" />
        <rect x="42" y="140" width="15" height="45" rx="4" />
        <rect x="63" y="140" width="15" height="45" rx="4" />
      </g>
      {/* Icône + */}
      <circle cx="60" cy="95" r="18" fill="none" stroke="rgba(0,217,255,0.15)" strokeWidth="1" />
      <line x1="60" y1="86" x2="60" y2="104" stroke="rgba(0,217,255,0.25)" strokeWidth="2" strokeLinecap="round" />
      <line x1="51" y1="95" x2="69" y2="95" stroke="rgba(0,217,255,0.25)" strokeWidth="2" strokeLinecap="round" />
      <text x="60" y="125" fontSize="7.5" fontFamily="monospace" textAnchor="middle" fill="rgba(0,217,255,0.3)" letterSpacing="0.5">
        LIBRE
      </text>
    </svg>
  );
}

// ─── Card personnage ─────────────────────────────────────────────────────
function CharacterCard({
  char,
  selected,
  onClick,
}: {
  char: Character;
  selected: boolean;
  onClick: () => void;
}) {
  const age = char.dateofbirth ? getAge(char.dateofbirth) : null;
  const isFemale = char.gender === "f" || char.gender === "mp_f_freemode_01";
  const hp = Math.max(0, Math.min(100, ((char.health - 100) / 100) * 100));
  const hpColor =
    hp > 60 ? "#10b981" : hp > 30 ? "#f59e0b" : "#ef4444";

  return (
    <button
      className={[styles.card, selected ? styles.cardSelected : ""].join(" ")}
      onClick={onClick}
    >
      {/* Silhouette visuelle */}
      <div className={styles.cardVisual}>
        <CharacterSilhouette
          gender={char.gender}
          job={char.job}
          health={char.health}
          selected={selected}
        />
        {selected && (
          <div className={styles.selectedBadge}>✓</div>
        )}
      </div>

      {/* Infos bas de carte */}
      <div className={styles.cardInfo}>
        <div className={styles.cardName}>
          {char.firstname} {char.lastname}
        </div>

        <div className={styles.cardMeta}>
          <span className={styles.genderIcon}>{isFemale ? "♀" : "♂"}</span>
          {age !== null && <span>{age} ans</span>}
        </div>

        {char.job && (
          <div className={styles.jobBadge}>
            {char.job === "unemployed" ? "Sans emploi" : char.job}
            {char.job_grade > 0 && (
              <span className={styles.jobGrade}> G{char.job_grade}</span>
            )}
          </div>
        )}

        <div className={styles.hpRow}>
          <div className={styles.hpBar}>
            <div
              className={styles.hpFill}
              style={{ width: `${hp}%`, background: hpColor }}
            />
          </div>
          <span className={styles.hpValue}>{Math.round(hp)}%</span>
        </div>
      </div>
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────
export default function CharacterSelect({
  visible,
  characters,
  slots,
}: CharacterSelectProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

  useEffect(() => {
    if (!visible) {
      setSelectedId(null);
      setLoading(false);
      setError("");
    }
  }, [visible]);

  const handlePlay = useCallback(async () => {
    if (selectedId === null) {
      setError("Veuillez sélectionner un personnage.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const resourceName =
        (window as any).GetParentResourceName?.() ?? "kt_character";
      const res = await fetch(`https://${resourceName}/selectCharacter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ charId: selectedId }),
      });
      if (!res.ok) {
        setError("Erreur lors de la sélection.");
        setLoading(false);
      }
    } catch {
      setError("Connexion perdue.");
      setLoading(false);
    }
  }, [selectedId]);

  if (!visible) return null;

  const usedSlots  = characters.length;
  const totalSlots = slots;
  const selectedChar = characters.find((c) => c.id === selectedId);

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>

        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h2 className={styles.title}>Choisir un personnage</h2>
            <div className={styles.slotRow}>
              {Array.from({ length: totalSlots }, (_, i) => (
                <div
                  key={i}
                  className={[
                    styles.slotDot,
                    i < usedSlots ? styles.slotDotFilled : styles.slotDotEmpty,
                  ].join(" ")}
                  title={i < usedSlots ? "Occupé" : "Libre"}
                />
              ))}
              <span className={styles.slotsText}>
                {usedSlots}/{totalSlots} slots
              </span>
            </div>
          </div>
        </div>

        {/* ── Grille de personnages ── */}
        <div
          className={styles.grid}
          style={{
            gridTemplateColumns: `repeat(${Math.min(totalSlots, 4)}, 1fr)`,
          }}
        >
          {characters.map((char) => (
            <CharacterCard
              key={char.id}
              char={char}
              selected={selectedId === char.id}
              onClick={() => setSelectedId(char.id)}
            />
          ))}

          {Array.from(
            { length: Math.max(0, totalSlots - usedSlots) },
            (_, i) => (
              <div key={`empty-${i}`} className={styles.emptySlot}>
                <EmptySlotSvg />
                <span className={styles.emptyLabel}>Slot libre</span>
              </div>
            )
          )}
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {/* ── Footer ── */}
        <div className={styles.footer}>
          <div className={styles.selectedInfo}>
            {selectedChar ? (
              <>
                <span className={styles.selectedName}>
                  {selectedChar.firstname} {selectedChar.lastname}
                </span>
                <span className={styles.selectedMeta}>
                  {selectedChar.job !== "unemployed"
                    ? selectedChar.job
                    : "Sans emploi"}
                </span>
              </>
            ) : (
              <span className={styles.hint}>
                Cliquez sur un personnage pour le sélectionner
              </span>
            )}
          </div>

          <button
            className={styles.playBtn}
            onClick={handlePlay}
            disabled={selectedId === null || loading}
          >
            {loading ? "⏳ Chargement..." : "▶ Jouer"}
          </button>
        </div>
      </div>
    </div>
  );
}
