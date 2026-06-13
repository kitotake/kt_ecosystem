-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- KT_CLOTHING — CLIENT MAIN
-- Boutique vêtements. Preview et sauvegarde via kt_character.
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

local nuiOpen      = false
local originalComp = {}
local originalProps = {}

local function getResource() return GetCurrentResourceName() end

-- ── OUVERTURE ─────────────────────────────────────────────────────────────

local function openShop()
    if nuiOpen then return end
    nuiOpen = true

    -- Sauvegarder l'apparence actuelle pour annulation
    local appearance = exports["kt_character"]:Character_GetCurrentAppearance()
    originalComp  = appearance and appearance.components or {}
    originalProps = appearance and appearance.props      or {}

    -- Démarrer la preview via kt_character
    exports["kt_character"]:Preview_Start({ camera = "body", heading = 180.0 })

    SetNuiFocus(true, true)
    SendNUIMessage({ type = "open", currentClothing = {
        components = originalComp,
        props      = originalProps,
    }})
end

local function closeShop(save)
    nuiOpen = false

    if not save then
        -- Remettre les vêtements originaux
        exports["kt_character"]:Preview_ApplyClothing(originalComp, originalProps)
        exports["kt_character"]:Appearance_ApplyClothing(originalComp, originalProps)
    end

    exports["kt_character"]:Preview_Stop()
    SetNuiFocus(false, false)
    SendNUIMessage({ type = "close" })
end

-- ── NUI CALLBACKS ─────────────────────────────────────────────────────────

-- Preview temps réel pendant la navigation
RegisterNUICallback("preview:clothing", function(data, cb)
    exports["kt_character"]:Preview_ApplyClothing(data.components, data.props)
    cb("ok")
end)

-- Achat / sauvegarde
RegisterNUICallback("clothing:buy", function(data, cb)
    local unique_id = exports["kt_character"]:Character_GetUniqueId()
    if not unique_id then cb("error") return end

    -- Appliquer sur le joueur
    exports["kt_character"]:Appearance_ApplyClothing(data.components, data.props)

    -- Sauvegarder via kt_character server
    TriggerServerEvent("kt_clothing:saveClothing", unique_id, data.components, data.props)
    closeShop(true)
    cb("ok")
end)

-- Annulation
RegisterNUICallback("close", function(_, cb)
    closeShop(false)
    cb("ok")
end)

-- Contrôle caméra
RegisterNUICallback("cameraControl", function(data, cb)
    exports["kt_character"]:Preview_CameraAction(data and data.action or "")
    cb("ok")
end)

-- ── EVENTS SERVEUR ────────────────────────────────────────────────────────

RegisterNetEvent("kt_clothing:open", function()
    openShop()
end)

-- ── COMMANDE DEBUG ────────────────────────────────────────────────────────

RegisterCommand("clothing", function()
    openShop()
end, false)

-- ── CLEANUP ───────────────────────────────────────────────────────────────

AddEventHandler("onResourceStop", function(resource)
    if resource ~= GetCurrentResourceName() then return end
    if nuiOpen then closeShop(false) end
end)
