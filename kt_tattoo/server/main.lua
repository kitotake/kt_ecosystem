-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- KT_TATTOO — SERVER MAIN
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RegisterNetEvent("kt_tattoo:saveTattoos", function(unique_id, tattoos)
    local src = source
    local active_uid = exports["kt_character"]:Character_GetUniqueId(src)
    if active_uid ~= unique_id then return end
    exports["kt_character"]:Character_SaveTattoos(src, tattoos)
    print("[kt_tattoo] Tatouages sauvegardés pour src:" .. src)
end)

print("[kt_tattoo] server chargé")
