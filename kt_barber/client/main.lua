-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- KT_BARBER — CLIENT MAIN
-- Salon de coiffure. Preview et sauvegarde via kt_character.
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

local nuiOpen    = false
local originalHair = {}

local function openBarber()
    if nuiOpen then return end
    nuiOpen = true

    local appearance = exports["kt_character"]:Character_GetCurrentAppearance()
    originalHair = appearance and appearance.hair or { style = 0, color = 0, highlight = 0 }

    exports["kt_character"]:Preview_Start({ camera = "hair", heading = 180.0 })
    exports["kt_character"]:Preview_SetCamera("hair")

    SetNuiFocus(true, true)
    SendNUIMessage({ type = "open", currentHair = originalHair })
end

local function closeBarber(save)
    nuiOpen = false

    if not save then
        exports["kt_character"]:Appearance_ApplyHair(originalHair)
    end

    exports["kt_character"]:Preview_Stop()
    SetNuiFocus(false, false)
    SendNUIMessage({ type = "close" })
end

RegisterNUICallback("preview:hair", function(data, cb)
    exports["kt_character"]:Preview_ApplyHair(data)
    cb("ok")
end)

RegisterNUICallback("barber:save", function(data, cb)
    local unique_id = exports["kt_character"]:Character_GetUniqueId()
    if not unique_id then cb("error") return end

    exports["kt_character"]:Appearance_ApplyHair(data.hair)
    TriggerServerEvent("kt_barber:saveHair", unique_id, data.hair)
    closeBarber(true)
    cb("ok")
end)

RegisterNUICallback("close", function(_, cb) closeBarber(false) cb("ok") end)
RegisterNUICallback("cameraControl", function(data, cb)
    exports["kt_character"]:Preview_CameraAction(data and data.action or "")
    cb("ok")
end)

RegisterNetEvent("kt_barber:open", function() openBarber() end)
RegisterCommand("barber", function() openBarber() end, false)

AddEventHandler("onResourceStop", function(resource)
    if resource ~= GetCurrentResourceName() then return end
    if nuiOpen then closeBarber(false) end
end)
