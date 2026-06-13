-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- KT_CLOTHING — SERVER MAIN
-- Sauvegarde déléguée à kt_character.
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RegisterNetEvent("kt_clothing:saveClothing", function(unique_id, components, props)
    local src = source

    -- Vérifier que le joueur possède ce unique_id
    local active_uid = exports["kt_character"]:Character_GetUniqueId(src)
    if active_uid ~= unique_id then
        print("[kt_clothing] Tentative sauvegarde non autorisée — src:" .. src)
        return
    end

    -- Déléguer la sauvegarde à kt_character
    local ok = exports["kt_character"]:Character_SaveClothing(src, components, props)
    if ok then
        print("[kt_clothing] Vêtements sauvegardés pour src:" .. src)
    end
end)

print("[kt_clothing] server chargé")
