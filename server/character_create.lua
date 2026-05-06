-- server/character_create.lua (kt_character)


RegisterNetEvent("kt_character:createCharacter", function(data)
    local src = source

    local isValid, msg = Validator.character(data)
    if not isValid then
        TriggerClientEvent("kt_character:error", src, msg)
        return
    end

    local license = Identifiers.getLicense(src)
    if not license then
        TriggerClientEvent("kt_character:error", src, "Identifiant joueur introuvable")
        return
    end

    local unique_id = data.unique_id
    if not unique_id or unique_id == "" then
        unique_id = exports['union']:generateUniqueId()
    end

    -- Normalisation : "m"/"f"/nil → modèle GTA V complet (stocké dans ped_model)
    local pedModel = Utils.normalizePedModel(data.gender or "mp_m_freemode_01")

    -- Position JSON initiale
    local posJson = json.encode({
        x       = Config.DEFAULT_SPAWN.x,
        y       = Config.DEFAULT_SPAWN.y,
        z       = Config.DEFAULT_SPAWN.z,
        heading = Config.DEFAULT_HEADING,
    })

    -- 1) INSERT characters — ped_model remplace gender + model
    exports.oxmysql:execute(
        [[INSERT INTO characters
            (unique_id, firstname, lastname, dateofbirth, ped_model, position)
          VALUES (?, ?, ?, ?, ?, ?)]],
        {
            unique_id,
            string.trim(data.firstname),
            string.trim(data.lastname),
            data.dateofbirth,
            pedModel,
            posJson,
        }
    )

    -- 2) INSERT user_character (relation N-N user ↔ personnage)
    exports.oxmysql:execute(
        [[INSERT IGNORE INTO user_character (identifier, unique_id)
          VALUES (?, ?)]],
        { license, unique_id }
    )

    -- 3) Préparer les données d'apparence
    --    · skin_data = headBlend + hair + headOverlays + components + props
    --    · face_features = tableau séparé (colonne dédiée)
    --    · tattoos = tableau séparé (colonne dédiée)
    local skinData = json.encode({
        gender       = pedModel,   -- on stocke le modèle complet dans le JSON aussi
        hair         = data.hair         or {},
        headBlend    = data.headBlend    or {},
        headOverlays = data.headOverlays or {},
        components   = data.components   or {},
        props        = data.props        or {},
    })

    local faceFeaturesJson = json.encode(data.faceFeatures or {})
    local tattoosJson      = json.encode(data.tattoos      or {})

    -- 4) INSERT character_appearances
    exports.oxmysql:execute(
        [[INSERT INTO character_appearances
            (unique_id, skin_data, face_features, tattoos)
          VALUES (?, ?, ?, ?)]],
        { unique_id, skinData, faceFeaturesJson, tattoosJson }
    )

    -- Objet retourné au client (pas de champ gender/model obsolètes)
    local character = {
        unique_id   = unique_id,
        firstname   = string.trim(data.firstname),
        lastname    = string.trim(data.lastname),
        dateofbirth = data.dateofbirth,
        ped_model   = pedModel,
        position    = vector3(Config.DEFAULT_SPAWN.x, Config.DEFAULT_SPAWN.y, Config.DEFAULT_SPAWN.z),
        heading     = Config.DEFAULT_HEADING,
    }

    Utils.debug("Personnage créé: " .. character.firstname .. " (" .. unique_id .. ")", "INFO")
    TriggerClientEvent("kt_character:created", src, character)
end)