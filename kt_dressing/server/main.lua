-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- KT_DRESSING — SERVER MAIN
-- Proxy vers les events kt_character pour la gestion des tenues.
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Récupérer la liste des tenues
RegisterNetEvent("kt_dressing:getOutfits", function(unique_id)
    local src = source
    local active_uid = exports["kt_character"]:Character_GetUniqueId(src)
    if active_uid ~= unique_id then return end

    -- Déléguer à kt_character
    TriggerEvent("kt_character:getOutfits_internal", src, unique_id, function(outfits)
        TriggerClientEvent("kt_dressing:outfitsList", src, outfits)
    end)
end)

-- Sauvegarder une tenue
RegisterNetEvent("kt_dressing:saveOutfit", function(data)
    local src = source
    local active_uid = exports["kt_character"]:Character_GetUniqueId(src)
    if not data or active_uid ~= data.unique_id then return end

    -- Proxy vers kt_character
    TriggerEvent("kt_character:saveOutfit_internal", src, data, function(outfit, err)
        if err then return end
        TriggerClientEvent("kt_dressing:outfitSaved", src, outfit)
    end)
end)

-- Supprimer une tenue
RegisterNetEvent("kt_dressing:deleteOutfit", function(data)
    local src = source
    local active_uid = exports["kt_character"]:Character_GetUniqueId(src)
    if not data or active_uid ~= data.unique_id then return end

    TriggerEvent("kt_character:deleteOutfit_internal", src, data, function(id, err)
        if err then return end
        TriggerClientEvent("kt_dressing:outfitDeleted", src, id)
    end)
end)

print("[kt_dressing] server chargé")
