RegisterNetEvent("kt_character:updateAppearance", function(data)
    local src = source
    if not src then return end

    if not data or not data.unique_id then return end

    -- =====================================================
    -- NORMALISATION PED MODEL (source unique)
    -- =====================================================
    local ped_model = data.ped_model

    if ped_model ~= "mp_m_freemode_01" and ped_model ~= "mp_f_freemode_01" then
        ped_model = "mp_m_freemode_01"
    end

    local skinData = json.encode({
        ped_model    = ped_model,
        gender       = (ped_model == "mp_f_freemode_01") and "f" or "m",

        hair         = data.hair         or {},
        headBlend    = data.headBlend    or {},
        faceFeatures = data.faceFeatures or {},
        headOverlays = data.headOverlays or {},
        components   = data.components   or {},
        props        = data.props        or {},
        tattoos      = data.tattoos      or {},
    })

    exports.oxmysql:execute(
        "UPDATE character_appearances SET skin_data = ?, updated_at = NOW() WHERE unique_id = ?",
        { skinData, data.unique_id },
        function(result)
            if result and result.affectedRows > 0 then
                Utils.debug("Apparence mise à jour pour " .. data.unique_id)
            else
                Utils.debug("Update skin failed: " .. data.unique_id, "WARN")
            end
        end
    )
end)