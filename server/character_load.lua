-- server/character_load.lua (kt_character) — VERSION CLEAN

local function normalizePed(model)
    if model == "mp_f_freemode_01" then
        return "mp_f_freemode_01", "f"
    end
    return "mp_m_freemode_01", "m"
end

local function decodePosition(raw)
    if raw then
        local ok, p = pcall(json.decode, tostring(raw))
        if ok and p and p.x then
            return p.x, p.y, p.z, p.heading
        end
    end
    return nil, nil, nil, nil
end

RegisterNetEvent("kt_character:loadCharacter", function(unique_id)
    local src = source
    if not src then return end

    if not unique_id or unique_id == "" then
        TriggerClientEvent("kt_character:error", src, "ID invalide")
        return
    end

    exports.oxmysql:execute([[
        SELECT c.*, ca.skin_data
        FROM characters c
        LEFT JOIN character_appearances ca ON ca.unique_id = c.unique_id
        WHERE c.unique_id = ? LIMIT 1
    ]],
    { unique_id },
    function(result)

        if not result or #result == 0 then
            TriggerClientEvent("kt_character:error", src, "Personnage non trouvé")
            return
        end

        local row = result[1]

        -- ✅ NORMALISATION PED (ULTRA IMPORTANT)
        local ped_model, gender = normalizePed(row.ped_model)

        row.ped_model = ped_model
        row.gender    = gender
        row.model     = ped_model -- compat anciens scripts

        -- ✅ POSITION JSON
        local px, py, pz, hdg = decodePosition(row.position)

        if px then
            row.position = vector3(px, py, pz)
            row.heading  = hdg or Config.DEFAULT_HEADING
        else
            -- fallback sécurité (au cas où DB cassée)
            row.position = vector3(
                Config.DEFAULT_SPAWN.x,
                Config.DEFAULT_SPAWN.y,
                Config.DEFAULT_SPAWN.z
            )
            row.heading = Config.DEFAULT_HEADING
        end

        -- ✅ SKIN DATA SAFE
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

        -- ✅ DATA SAFE (évite crash client)
        row.firstname = row.firstname or ""
        row.lastname  = row.lastname or ""
        row.job       = row.job or "unemployed"
        row.job_grade = row.job_grade or 0

        -- ✅ SEND CLIENT
        TriggerClientEvent("kt_appearance:update", src, row)
        TriggerClientEvent("union:spawn:apply", src, row)
    end)
end)