-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- KT_CHARACTER — CLIENT MAIN
-- Point d'entrée minimal — toute la logique est dans client/core/
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Citizen.CreateThread(function()
    Wait(500)
    print("^2[kt_character] v" .. KT.Config.VERSION .. " (client) chargé^0")
end)
