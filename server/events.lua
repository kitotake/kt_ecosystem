-- server/events.lua (kt_character) — CLEAN VERSION

-- =========================================================
-- UNION FLOW
-- =========================================================

AddEventHandler("union:spawn:noCharacters_server", function(src)
    if not src then return end
    TriggerClientEvent("kt_character:openCreator", src)
end)

AddEventHandler("union:spawn:hasCharacters_server", function(src, characters, slots)
    if not src then return end

    if not characters or #characters == 0 then
        TriggerClientEvent("kt_character:openCreator", src)
        return
    end

    TriggerClientEvent("kt_character:openCharacterSelection", src, characters, slots or 3)
end)

-- =========================================================
-- SELECT CHARACTER
-- =========================================================
RegisterNetEvent("kt_character:selectCharacter", function(charId)
    local src = source
    if not src then return end

    if not charId then
        TriggerClientEvent("kt_character:error", src, "ID de personnage invalide")
        return
    end

    Utils.debug("selectCharacter: charId=" .. tostring(charId) .. " src=" .. src, "INFO")

    exports.oxmysql:execute([[
        SELECT c.*, ca.skin_data
        FROM characters c
        LEFT JOIN character_appearances ca ON ca.unique_id = c.unique_id
        WHERE c.id = ? LIMIT 1
    ]],
    { charId },
    function(result)

        if not result or #result == 0 then
            TriggerClientEvent("kt_character:error", src, "Personnage introuvable")
            return
        end

        local row = result[1]

        -- =====================================================
        -- PED MODEL (SOURCE UNIQUE)
        -- =====================================================
        local ped_model = row.ped_model

        if ped_model ~= "mp_m_freemode_01" and ped_model ~= "mp_f_freemode_01" then
            ped_model = "mp_m_freemode_01"
        end

        local gender = (ped_model == "mp_f_freemode_01") and "f" or "m"

        row.ped_model = ped_model
        row.gender    = gender
        row.model     = ped_model

        -- =====================================================
        -- POSITION JSON CLEAN
        -- =====================================================
        local px, py, pz, hdg

        if row.position then
            local ok, p = pcall(json.decode, tostring(row.position))
            if ok and p and p.x then
                px, py, pz, hdg = p.x, p.y, p.z, p.heading
            end
        end

        row.position = vector3(
            px or Config.DEFAULT_SPAWN.x,
            py or Config.DEFAULT_SPAWN.y,
            pz or Config.DEFAULT_SPAWN.z
        )

        row.heading = hdg or Config.DEFAULT_HEADING

        -- =====================================================
        -- SKIN DATA SAFE
        -- =====================================================
        if row.skin_data then
            local ok, skin = pcall(json.decode, row.skin_data)
            if ok and skin then
                row.hair         = skin.hair or {}
                row.headBlend    = skin.headBlend or {}
                row.faceFeatures = skin.faceFeatures or {}
                row.headOverlays = skin.headOverlays or {}
                row.components   = skin.components or {}
                row.props        = skin.props or {}
                row.tattoos      = skin.tattoos or {}
            end
        end

        -- safety defaults
        row.firstname = row.firstname or ""
        row.lastname  = row.lastname or ""
        row.job       = row.job or "unemployed"
        row.job_grade = row.job_grade or 0

        -- =====================================================
        -- SPAWN PIPELINE
        -- =====================================================
        TriggerClientEvent("union:spawn:apply", src, row)
        TriggerEvent("union:spawn:characterSelected", src, row)

        Utils.debug("Personnage sélectionné: " .. row.firstname, "INFO")
    end)
end)

-- =========================================================
-- DEBUG COMMAND
-- =========================================================
RegisterCommand("openselect", function(src)
    if src == 0 then return end

    local license = Identifiers.getLicense(src)
    if not license then return end

    exports.oxmysql:execute([[
        SELECT id, unique_id, firstname, lastname, dateofbirth,
               ped_model, job, job_grade, health, armor
        FROM characters
        WHERE identifier = ?
        ORDER BY id ASC
    ]],
    { license },
    function(characters)
        characters = characters or {}

        for i = 1, #characters do
            local c = characters[i]

            local ped_model = c.ped_model
            if ped_model ~= "mp_m_freemode_01" and ped_model ~= "mp_f_freemode_01" then
                ped_model = "mp_m_freemode_01"
            end

            c.ped_model = ped_model
            c.gender = (ped_model == "mp_f_freemode_01") and "f" or "m"
        end

        TriggerClientEvent("kt_character:openCharacterSelection", src, characters, 3)
    end)
end, false)