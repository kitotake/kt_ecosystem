-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- KT_CREATION — CLIENT MAIN
-- Gère l'ouverture/fermeture de l'UI de création.
-- Délègue TOUT à kt_character via exports.
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

local nuiOpen = false

-- ── HELPERS ───────────────────────────────────────────────────────────────

local function getResource()
    return GetCurrentResourceName()
end

local function nuiFetch(endpoint, data)
    return fetch("https://" .. getResource() .. "/" .. endpoint, {
        method  = "POST",
        headers = { ["Content-Type"] = "application/json" },
        body    = json.encode(data or {}),
    })
end

-- ── OUVERTURE ─────────────────────────────────────────────────────────────

local function openCreator()
    if nuiOpen then return end
    nuiOpen = true

    -- 1. Démarrer la preview via kt_character
    exports["kt_character"]:Preview_Start({ camera = "face", heading = 180.0 })
    exports["kt_character"]:Preview_SetCamera("face")

    -- 2. Ouvrir l'UI
    SetNuiFocus(true, true)
    SendNUIMessage({ type = "open" })

    -- 3. Envoyer l'identifiant au NUI
    local identifier = exports["kt_character"]:Character_GetIdentifier()
    local unique_id  = exports["kt_character"]:Character_GetUniqueId()
    SendNUIMessage({
        type       = "setIdentifier",
        identifier = identifier or "",
        unique_id  = unique_id  or "",
    })

    print("[kt_creation] Creator ouvert")
end

local function closeCreator()
    nuiOpen = false
    exports["kt_character"]:Preview_Stop()
    SetNuiFocus(false, false)
    SendNUIMessage({ type = "close" })
    print("[kt_creation] Creator fermé")
end

-- ── NUI CALLBACKS ─────────────────────────────────────────────────────────

-- Preview temps réel — délégué à kt_character
RegisterNUICallback("preview:update", function(data, cb)
    exports["kt_character"]:Preview_ApplyPartial(data)
    cb("ok")
end)

RegisterNUICallback("preview:applyClothing", function(data, cb)
    exports["kt_character"]:Preview_ApplyClothing(data.components, data.props)
    cb("ok")
end)

-- Changement d'onglet → focus caméra
RegisterNUICallback("tabChange", function(data, cb)
    local tab = data and data.tab or "identity"
    local presets = {
        parents  = "face",
        features = "face",
        overlays = "face",
        hair     = "hair",
        clothing = "body",
        tattoos  = "full",
    }
    exports["kt_character"]:Preview_SetCamera(presets[tab] or "face")
    cb("ok")
end)

-- Contrôle caméra
RegisterNUICallback("cameraControl", function(data, cb)
    exports["kt_character"]:Preview_CameraAction(data and data.action or "")
    cb("ok")
end)

-- Création personnage → server
RegisterNUICallback("character:create", function(data, cb)
    TriggerServerEvent("kt_creation:createCharacter", data)
    cb("ok")
end)

-- Fermeture manuelle
RegisterNUICallback("close", function(_, cb)
    closeCreator()
    cb("ok")
end)

-- ── EVENTS SERVEUR ────────────────────────────────────────────────────────

RegisterNetEvent("kt_creation:created", function(character)
    print("[kt_creation] Personnage créé: " .. (character.firstname or "?"))
    closeCreator()
end)

RegisterNetEvent("kt_creation:error", function(msg)
    SendNUIMessage({ type = "error", message = msg })
end)

-- ── EVENTS D'OUVERTURE (union / kt_character) ─────────────────────────────

RegisterNetEvent("kt_character:openCreator", function()
    openCreator()
end)

RegisterNetEvent("union:spawn:noCharacters", function()
    openCreator()
end)

-- ── DEBUG ─────────────────────────────────────────────────────────────────

RegisterCommand("creator", function()
    openCreator()
end, false)

-- ── CLEANUP ───────────────────────────────────────────────────────────────

AddEventHandler("onResourceStop", function(resource)
    if resource ~= GetCurrentResourceName() then return end
    if nuiOpen then closeCreator() end
end)
