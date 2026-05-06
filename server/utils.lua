-- server/utils.lua (kt_character)
-- SYNC SQL : gender/ENUM supprimé → ped_model VARCHAR(60) direct
-- Plus de conversion m/f ↔ model GTA V : la BDD stocke directement le modèle GTA V

Utils = {}

function Utils.debug(message, level)
    if not Config.DEBUG then return end
    level = level or "INFO"
    print(("^2[kt_character:%s]^7 %s"):format(level, message))
end

function string.trim(s)
    return s:match("^%s*(.-)%s*$")
end

-- Normalise n'importe quelle entrée vers un modèle GTA V valide.
-- Gère : "m", "f", "mp_m_freemode_01", "mp_f_freemode_01", nil
function Utils.normalizePedModel(input)
    if input == "f" or input == "mp_f_freemode_01" then
        return "mp_f_freemode_01"
    end
    return "mp_m_freemode_01"
end

-- Rétrocompatibilité : anciens appels modelToGenderEnum / genderEnumToModel
-- Conservés pour ne pas casser d'éventuels appels externes,
-- mais redirigés vers normalizePedModel
function Utils.modelToGenderEnum(model)
    -- Inutilisé en interne (plus d'ENUM en BDD), conservé pour compat externe
    if model == "mp_f_freemode_01" or model == "f" then return "f" end
    return "m"
end

function Utils.genderEnumToModel(enum)
    return Utils.normalizePedModel(enum)
end