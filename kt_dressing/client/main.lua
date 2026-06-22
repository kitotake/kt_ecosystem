-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- KT_DRESSING — CLIENT MAIN
-- Gestion des tenues sauvegardées via kt_character.
--
-- FIX : ce fichier passait auparavant par kt_dressing/server/main.lua, qui
-- relayait vers des events "kt_character:*_internal" qui n'existent pas
-- (aucun handler côté kt_character). Lister/sauvegarder/supprimer une
-- tenue ne faisait donc strictement rien.
-- kt_character expose déjà ces actions comme de VRAIS events réseau
-- (kt_character:getOutfits / saveOutfit / deleteOutfit), prévus pour être
-- déclenchés directement depuis le client. On les utilise donc ici
-- directement, sans passer par le serveur de kt_dressing.
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

local nuiOpen = false

local function openDressing()
    if nuiOpen then return end
    nuiOpen = true

    exports["kt_character"]:Preview_Start({ camera = "full", heading = 180.0 })

    SetNuiFocus(true, true)
    SendNUIMessage({ type = "open" })

    -- FIX : appel direct à kt_character (event réseau réel) au lieu de
    -- "kt_dressing:getOutfits" qui ne menait nulle part.
    local unique_id = exports["kt_character"]:Character_GetUniqueId()
    if unique_id then
        TriggerServerEvent("kt_character:getOutfits", { unique_id = unique_id })
    end
end

local function closeDressing()
    if not nuiOpen then return end
    nuiOpen = false
    exports["kt_character"]:Preview_Stop()
    SetNuiFocus(false, false)
    SendNUIMessage({ type = "close" })
end

-- ── NUI CALLBACKS ─────────────────────────────────────────────────────────

RegisterNUICallback("outfit:preview", function(data, cb)
    exports["kt_character"]:Preview_ApplyClothing(data.components, data.props)
    cb("ok")
end)

RegisterNUICallback("outfit:wear", function(data, cb)
    exports["kt_character"]:Appearance_ApplyClothing(data.components, data.props)
    closeDressing()
    cb("ok")
end)

-- FIX : event réseau réel "kt_character:saveOutfit" au lieu de
-- "kt_dressing:saveOutfit" (qui relayait vers du code mort).
RegisterNUICallback("outfit:save", function(data, cb)
    local unique_id = exports["kt_character"]:Character_GetUniqueId()
    if not unique_id then cb("error") return end
    data.unique_id = unique_id
    TriggerServerEvent("kt_character:saveOutfit", data)
    cb("ok")
end)

-- FIX : idem pour la suppression.
RegisterNUICallback("outfit:delete", function(data, cb)
    local unique_id = exports["kt_character"]:Character_GetUniqueId()
    if not unique_id then cb("error") return end
    data.unique_id = unique_id
    TriggerServerEvent("kt_character:deleteOutfit", data)
    cb("ok")
end)

RegisterNUICallback("cameraControl", function(data, cb)
    exports["kt_character"]:Preview_CameraAction(data and data.action or "")
    cb("ok")
end)

RegisterNUICallback("close", function(_, cb)
    closeDressing()
    cb("ok")
end)

-- ── EVENTS SERVEUR (kt_character — réels) ─────────────────────────────────

-- FIX : on écoute désormais les events que kt_character envoie réellement
-- ("kt_character:outfitsList" / "outfitSaved" / "outfitDeleted" / "error"),
-- et on les retransmet au NUI sous le même format qu'avant pour ne pas
-- casser le frontend web (qui attend type="outfitsList", etc.).
RegisterNetEvent("kt_character:outfitsList", function(outfits)
    SendNUIMessage({ type = "outfitsList", outfits = outfits })
end)

RegisterNetEvent("kt_character:outfitSaved", function(outfit)
    SendNUIMessage({ type = "outfitSaved", outfit = outfit })
end)

RegisterNetEvent("kt_character:outfitDeleted", function(id)
    SendNUIMessage({ type = "outfitDeleted", id = id })
end)

-- FIX : kt_character renvoie les erreurs de sauvegarde/suppression de tenue
-- (nom invalide, accès refusé, etc.) via cet event générique. On ne
-- l'affiche que si le dressing est ouvert, pour éviter d'afficher des
-- erreurs venant d'un autre flux kt_character (création de perso, etc.).
RegisterNetEvent("kt_character:error", function(msg)
    if nuiOpen then
        SendNUIMessage({ type = "error", message = msg })
    end
end)

RegisterNetEvent("kt_dressing:open", function() openDressing() end)

RegisterCommand("dressing", function() openDressing() end, false)

AddEventHandler("onResourceStop", function(resource)
    if resource ~= GetCurrentResourceName() then return end
    if nuiOpen then closeDressing() end
end)