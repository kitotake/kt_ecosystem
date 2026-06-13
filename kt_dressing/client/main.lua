-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- KT_DRESSING — CLIENT MAIN
-- Gestion des tenues sauvegardées via kt_character.
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

local nuiOpen = false

local function openDressing()
    if nuiOpen then return end
    nuiOpen = true

    exports["kt_character"]:Preview_Start({ camera = "full", heading = 180.0 })

    SetNuiFocus(true, true)
    SendNUIMessage({ type = "open" })

    -- Charger les tenues depuis le serveur
    local unique_id = exports["kt_character"]:Character_GetUniqueId()
    if unique_id then
        TriggerServerEvent("kt_dressing:getOutfits", unique_id)
    end
end

local function closeDressing()
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

RegisterNUICallback("outfit:save", function(data, cb)
    local unique_id = exports["kt_character"]:Character_GetUniqueId()
    if not unique_id then cb("error") return end
    data.unique_id = unique_id
    TriggerServerEvent("kt_dressing:saveOutfit", data)
    cb("ok")
end)

RegisterNUICallback("outfit:delete", function(data, cb)
    local unique_id = exports["kt_character"]:Character_GetUniqueId()
    if not unique_id then cb("error") return end
    data.unique_id = unique_id
    TriggerServerEvent("kt_dressing:deleteOutfit", data)
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

-- ── EVENTS SERVEUR ────────────────────────────────────────────────────────

RegisterNetEvent("kt_dressing:outfitsList", function(outfits)
    SendNUIMessage({ type = "outfitsList", outfits = outfits })
end)

RegisterNetEvent("kt_dressing:outfitSaved", function(outfit)
    SendNUIMessage({ type = "outfitSaved", outfit = outfit })
end)

RegisterNetEvent("kt_dressing:outfitDeleted", function(id)
    SendNUIMessage({ type = "outfitDeleted", id = id })
end)

RegisterNetEvent("kt_dressing:open", function() openDressing() end)

RegisterCommand("dressing", function() openDressing() end, false)

AddEventHandler("onResourceStop", function(resource)
    if resource ~= GetCurrentResourceName() then return end
    if nuiOpen then closeDressing() end
end)
