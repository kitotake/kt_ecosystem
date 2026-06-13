-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- KT_CREATION — SERVER MAIN
-- Reçoit les données de création et les transmet à kt_character.
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RegisterNetEvent("kt_creation:createCharacter", function(data)
    local src = source

    -- On délègue entièrement à kt_character
    TriggerEvent("kt_character:createCharacter_internal", src, data, function(character, err)
        if err then
            TriggerClientEvent("kt_creation:error", src, err)
            return
        end
        TriggerClientEvent("kt_creation:created", src, character)
    end)
end)

-- Écouter les events internes kt_character via exports
CreateThread(function()
    Wait(500) -- attendre que kt_character soit chargé

    -- S'abonner au succès de création pour notifier kt_creation
    exports["kt_character"]:On("kt_character:internal:characterCreated", function(src, character)
        -- kt_character gère déjà la notification, rien à faire ici
        -- sauf si kt_creation veut faire des actions supplémentaires
    end)
end)

print("[kt_creation] server chargé")
