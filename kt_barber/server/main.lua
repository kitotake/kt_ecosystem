-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- KT_BARBER — SERVER MAIN
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RegisterNetEvent("kt_barber:saveHair", function(unique_id, hair)
    local src = source
    local active_uid = exports["kt_character"]:Character_GetUniqueId(src)
    if active_uid ~= unique_id then return end
    exports["kt_character"]:Character_SaveHair(src, hair)
    print("[kt_barber] Coiffure sauvegardée pour src:" .. src)
end)

print("[kt_barber] server chargé")
