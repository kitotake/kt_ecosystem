-- server/outfits.lua (kt_character) — OPTIMIZED

local DEBUG = true

local function debugLog(msg, level)
    if not DEBUG then return end
    print(("^3[kt_outfits:%s]^7 %s"):format(level or "INFO", msg))
end

-- =====================================================
-- SAFE UTILS
-- =====================================================
local function trim(s)
    return (s and string.gsub(s, "^%s*(.-)%s*$", "%1")) or ""
end

local function encode(data)
    return json.encode(data or {})
end

local function decode(data)
    if not data then return {} end
    local ok, res = pcall(json.decode, data)
    return ok and res or {}
end

-- =====================================================
-- VALIDATION
-- =====================================================
local function validateOutfitData(data)
    if not data then return false, "Données manquantes" end
    if not data.unique_id or data.unique_id == "" then
        return false, "unique_id manquant"
    end

    local name = trim(data.name)
    if name == "" then
        return false, "Nom invalide"
    end

    if #name > 50 then
        return false, "Nom trop long"
    end

    return true
end

-- =====================================================
-- SAVE OUTFIT
-- =====================================================
RegisterNetEvent("kt_character:saveOutfit", function(data)
    local src = source

    local ok, err = validateOutfitData(data)
    if not ok then
        TriggerClientEvent("kt_character:error", src, err)
        return
    end

    local outfitName = trim(data.name)

    debugLog(("Save outfit %s"):format(outfitName), "INFO")

    exports.oxmysql:execute([[
        INSERT INTO character_outfits
        (unique_id, name, components, props)
        VALUES (?, ?, ?, ?)
    ]],
    {
        data.unique_id,
        outfitName,
        encode(data.components),
        encode(data.props)
    },
    function(res)
        if res and res.affectedRows > 0 then
            TriggerClientEvent("kt_character:outfitSaved", src, {
                id   = res.insertId,
                name = outfitName
            })
        else
            TriggerClientEvent("kt_character:error", src, "Erreur sauvegarde tenue")
        end
    end)
end)

-- =====================================================
-- GET OUTFITS
-- =====================================================
RegisterNetEvent("kt_character:getOutfits", function(data)
    local src = source
    if not data or not data.unique_id then return end

    exports.oxmysql:execute([[
        SELECT id, name, components, props, is_job_outfit, job_name, job_grade, created_at
        FROM character_outfits
        WHERE unique_id = ? AND is_job_outfit = 0
        ORDER BY created_at DESC
    ]],
    { data.unique_id },
    function(results)
        results = results or {}

        for i = 1, #results do
            results[i].components = decode(results[i].components)
            results[i].props      = decode(results[i].props)
        end

        TriggerClientEvent("kt_character:outfitsList", src, results)
    end)
end)

-- =====================================================
-- LOAD OUTFIT
-- =====================================================
RegisterNetEvent("kt_character:loadOutfit", function(data)
    local src = source
    if not data or not data.outfit_id then return end

    exports.oxmysql:execute(
        "SELECT * FROM character_outfits WHERE id = ? LIMIT 1",
        { data.outfit_id },
        function(res)
            if not res or #res == 0 then
                TriggerClientEvent("kt_character:error", src, "Tenue introuvable")
                return
            end

            local outfit = res[1]
            outfit.components = decode(outfit.components)
            outfit.props      = decode(outfit.props)

            TriggerClientEvent("kt_character:applyOutfit", src, outfit)
        end
    )
end)

-- =====================================================
-- DELETE OUTFIT
-- =====================================================
RegisterNetEvent("kt_character:deleteOutfit", function(data)
    local src = source
    if not data or not data.outfit_id or not data.unique_id then return end

    exports.oxmysql:execute(
        "DELETE FROM character_outfits WHERE id = ? AND unique_id = ?",
        { data.outfit_id, data.unique_id },
        function(res)
            if res and res.affectedRows > 0 then
                TriggerClientEvent("kt_character:outfitDeleted", src, data.outfit_id)
            else
                TriggerClientEvent("kt_character:error", src, "Suppression impossible")
            end
        end
    )
end)

-- =====================================================
-- JOB OUTFITS AUTO APPLY
-- =====================================================
AddEventHandler("kt_character:onJobChange", function(src, jobName, jobGrade, uniqueId)
    if not src or not jobName then return end

    exports.oxmysql:execute([[
        SELECT components, props
        FROM character_outfits
        WHERE job_name = ? AND job_grade <= ? AND is_job_outfit = 1
        ORDER BY job_grade DESC
        LIMIT 1
    ]],
    { jobName, jobGrade or 0 },
    function(res)
        if not res or #res == 0 then return end

        local outfit = res[1]
        outfit.components = decode(outfit.components)
        outfit.props      = decode(outfit.props)

        TriggerClientEvent("kt_character:applyOutfit", src, outfit)
    end)
end)

-- =====================================================
-- SAVE JOB OUTFIT (ADMIN)
-- =====================================================
RegisterNetEvent("kt_character:saveJobOutfit", function(data)
    local src = source
    if not data or not data.job_name then return end

    exports.oxmysql:execute([[
        INSERT INTO character_outfits
        (unique_id, name, components, props, is_job_outfit, job_name, job_grade)
        VALUES ('system', ?, ?, ?, 1, ?, ?)
        ON DUPLICATE KEY UPDATE
            components = VALUES(components),
            props = VALUES(props)
    ]],
    {
        data.name or (data.job_name .. "_grade_" .. data.job_grade),
        encode(data.components),
        encode(data.props),
        data.job_name,
        data.job_grade
    })
end)

-- NOTE: reloadSkin supprimé volontairement (unique handler ailleurs)