-- server/character_create.lua (kt_character)
-- FIX : inserts séquentiels (callbacks chaînés) pour éviter les race conditions FK.
-- FIX : vérification du retour de generateUniqueId.
-- FIX : validation format date complet YYYY-MM-DD.

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

    -- FIX : vérification du unique_id généré
    local unique_id = data.unique_id
    if not unique_id or unique_id == "" then
        local ok, result = pcall(function()
            return exports['union']:generateUniqueId()
        end)
        if not ok or not result or result == "" then
            TriggerClientEvent("kt_character:error", src, "Impossible de générer un identifiant unique")
            return
        end
        unique_id = result
    end

    -- FIX : validation format date YYYY-MM-DD complet
    local dateStr = tostring(data.dateofbirth or "")
    if not dateStr:match("^%d%d%d%d%-%d%d%-%d%d$") then
        TriggerClientEvent("kt_character:error", src, "Format de date invalide (attendu : YYYY-MM-DD)")
        return
    end

    local pedModel   = Utils.normalizePedModel(data.gender or "mp_m_freemode_01")
    local firstname  = string.trim(data.firstname)
    local lastname   = string.trim(data.lastname)

    local posJson = json.encode({
        x       = Config.DEFAULT_SPAWN.x,
        y       = Config.DEFAULT_SPAWN.y,
        z       = Config.DEFAULT_SPAWN.z,
        heading = Config.DEFAULT_HEADING,
    })

    -- === 1) INSERT characters ===
    exports.oxmysql:execute(
        [[INSERT INTO characters
            (unique_id, firstname, lastname, dateofbirth, ped_model, position)
          VALUES (?, ?, ?, ?, ?, ?)]],
        { unique_id, firstname, lastname, dateStr, pedModel, posJson },
        function(res1)
            if not res1 or (res1.affectedRows and res1.affectedRows == 0) then
                TriggerClientEvent("kt_character:error", src, "Erreur création personnage (characters)")
                return
            end

            -- === 2) INSERT user_character (dans le callback du 1er INSERT) ===
            exports.oxmysql:execute(
                [[INSERT IGNORE INTO user_character (identifier, unique_id) VALUES (?, ?)]],
                { license, unique_id },
                function(res2)
                    -- Pas bloquant si IGNORE absorbe un doublon

                    -- skin_data : tout sauf faceFeatures et tattoos (colonnes séparées)
                    local skinData = json.encode({
                        gender       = pedModel,
                        hair         = data.hair         or {},
                        headBlend    = data.headBlend    or {},
                        headOverlays = data.headOverlays or {},
                        components   = data.components   or {},
                        props        = data.props        or {},
                    })

                    -- FIX : face_features et tattoos dans leurs colonnes dédiées
                    local faceFeaturesJson = json.encode(data.faceFeatures or {})
                    local tattoosJson      = json.encode(data.tattoos      or {})

                    -- === 3) INSERT character_appearances (dans le callback du 2ème) ===
                    exports.oxmysql:execute(
                        [[INSERT INTO character_appearances
                            (unique_id, skin_data, face_features, tattoos)
                          VALUES (?, ?, ?, ?)]],
                        { unique_id, skinData, faceFeaturesJson, tattoosJson },
                        function(res3)
                            if not res3 or (res3.affectedRows and res3.affectedRows == 0) then
                                Utils.debug("Avertissement : character_appearances non inséré pour " .. unique_id, "WARN")
                            end

                            local character = {
                                unique_id   = unique_id,
                                firstname   = firstname,
                                lastname    = lastname,
                                dateofbirth = dateStr,
                                ped_model   = pedModel,
                                position    = vector3(Config.DEFAULT_SPAWN.x, Config.DEFAULT_SPAWN.y, Config.DEFAULT_SPAWN.z),
                                heading     = Config.DEFAULT_HEADING,
                            }

                            Utils.debug("Personnage créé: " .. firstname .. " (" .. unique_id .. ")", "INFO")
                            TriggerClientEvent("kt_character:created", src, character)
                        end
                    )
                end
            )
        end
    )
end)
