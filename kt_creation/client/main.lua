-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- KT_CREATION — CLIENT MAIN
-- Gère l'ouverture/fermeture de l'UI de création.
-- Délègue TOUT à kt_character via exports + events réseau réels.
--
-- FIX : la création passait auparavant par "kt_creation:createCharacter"
-- → kt_creation/server/main.lua → TriggerEvent("kt_character:createCharacter_internal", ...)
-- Cet event n'existe nulle part (ni handler, ni export) : le callback
-- n'était jamais appelé, le wizard restait bloqué indéfiniment sur
-- "Création...". On déclenche maintenant directement l'event réseau
-- réellement géré côté union (server/modules/character/manager/
-- characterManager.lua) : "kt_character:characterCreated", qui crée le
-- personnage ET le spawn.
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
    if not nuiOpen then return end
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

-- FIX : on envoie directement l'event réseau réel géré côté union,
-- au lieu de "kt_creation:createCharacter" qui ne menait nulle part.
RegisterNUICallback("character:create", function(data, cb)
    TriggerServerEvent("kt_character:characterCreated", data)
    cb("ok")
end)

-- Fermeture manuelle
RegisterNUICallback("close", function(_, cb)
    closeCreator()
    cb("ok")
end)

-- ── EVENTS SERVEUR ────────────────────────────────────────────────────────

-- FIX : "union:spawn:apply" est l'event envoyé par le serveur une fois le
-- personnage créé ET sélectionné avec succès (Character.select, déclenché
-- en chaîne par characterManager.lua après "kt_character:characterCreated").
-- Si le créateur est encore ouvert quand cet event arrive, la création
-- vient de réussir : on ferme le wizard et on laisse le spawn normal
-- (client/modules/spawn/manager/handler.lua) prendre le relais.
RegisterNetEvent("union:spawn:apply", function()
    if nuiOpen then
        print("[kt_creation] Personnage créé avec succès — fermeture du wizard")
        closeCreator()
    end
end)

-- FIX : "characters:error" est le vrai event d'erreur envoyé par
-- characterManager.lua en cas d'échec de création/sélection.
RegisterNetEvent("characters:error", function(msg)
    if nuiOpen then
        SendNUIMessage({ type = "error", message = msg })
    end
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