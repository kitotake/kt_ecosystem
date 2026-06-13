-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- KT_TATTOO — CLIENT MAIN
-- Salon de tatouage. Preview et sauvegarde via kt_character.
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

local nuiOpen      = false
local originalTats = {}

local function openTattoo()
    if nuiOpen then return end
    nuiOpen = true

    local appearance = exports["kt_character"]:Character_GetCurrentAppearance()
    originalTats = appearance and appearance.tattoos or {}

    exports["kt_character"]:Preview_Start({ camera = "full", heading = 180.0 })
    exports["kt_character"]:Preview_SetCamera("full")

    SetNuiFocus(true, true)
    SendNUIMessage({ type = "open", currentTattoos = originalTats })
end

local function closeTattoo(save)
    nuiOpen = false

    if not save then
        exports["kt_character"]:Appearance_ApplyTattoos(originalTats, true)
    end

    exports["kt_character"]:Preview_Stop()
    SetNuiFocus(false, false)
    SendNUIMessage({ type = "close" })
end

RegisterNUICallback("preview:tattoos", function(data, cb)
    exports["kt_character"]:Preview_ApplyTattoos(data.tattoos, true)
    cb("ok")
end)

RegisterNUICallback("tattoo:save", function(data, cb)
    local unique_id = exports["kt_character"]:Character_GetUniqueId()
    if not unique_id then cb("error") return end

    exports["kt_character"]:Appearance_ApplyTattoos(data.tattoos, true)
    TriggerServerEvent("kt_tattoo:saveTattoos", unique_id, data.tattoos)
    closeTattoo(true)
    cb("ok")
end)

RegisterNUICallback("close", function(_, cb) closeTattoo(false) cb("ok") end)
RegisterNUICallback("cameraControl", function(data, cb)
    exports["kt_character"]:Preview_CameraAction(data and data.action or "")
    cb("ok")
end)

RegisterNetEvent("kt_tattoo:open", function() openTattoo() end)
RegisterCommand("tattoo", function() openTattoo() end, false)

AddEventHandler("onResourceStop", function(resource)
    if resource ~= GetCurrentResourceName() then return end
    if nuiOpen then closeTattoo(false) end
end)
