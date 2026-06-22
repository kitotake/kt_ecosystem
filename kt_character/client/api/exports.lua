-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- KT_CHARACTER — CLIENT EXPORTS (API publique)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ════════════════════════════════════════════════════════════
-- FIX FATAL-1 : export _isReady() attendu par union/handler.lua
-- Sans cet export, union attend 8s à chaque spawn → écran noir.
-- ════════════════════════════════════════════════════════════

exports("_isReady", function()
    return State ~= nil and State._ready == true
end)

-- ════════════════════════════════════════════════════════════
-- PREVIEW
-- ════════════════════════════════════════════════════════════

exports("Preview_Start", function(options)
    Preview.Start(options)
end)

exports("Preview_Stop", function()
    Preview.Stop()
end)

exports("Preview_Refresh", function()
    Preview.Refresh()
end)

exports("Preview_SetCamera", function(preset)
    if Camera.IsActive() then
        Camera.SetPreset(preset, { interp = true })
    end
end)

exports("Preview_CameraAction", function(action)
    Camera.HandleAction(action)
end)

exports("Preview_Rotate", function(degrees)
    Preview.Rotate(degrees)
end)

exports("Preview_SetFaceZoom", function(state)
    Preview.SetFaceZoom(state)
end)

exports("Preview_IsActive", function()
    return Preview.IsActive()
end)

exports("Preview_GetPed", function()
    return Preview.GetPed()
end)

exports("Preview_PlayAnim", function(dict, anim)
    Preview.PlayAnim(dict, anim)
end)

exports("Preview_ResetAnim", function()
    Preview.ResetAnim()
end)

-- ════════════════════════════════════════════════════════════
-- APPARENCE — APPLICATION SUR LE PED PREVIEW
-- ════════════════════════════════════════════════════════════

exports("Preview_ApplyAppearance", function(data)
    if not Preview.IsActive() then return end
    Ped.ApplyFullAppearance(Preview.GetPed(), data)
end)

exports("Preview_ApplyClothing", function(components, props)
    if not Preview.IsActive() then return end
    Ped.ApplyClothing(Preview.GetPed(), components, props)
end)

exports("Preview_ApplyHair", function(hair)
    if not Preview.IsActive() then return end
    Ped.ApplyHair(Preview.GetPed(), hair)
end)

exports("Preview_ApplyTattoos", function(tattoos, clearFirst)
    if not Preview.IsActive() then return end
    Ped.ApplyTattoos(Preview.GetPed(), tattoos, clearFirst)
end)

exports("Preview_ApplyPartial", function(data)
    if not Preview.IsActive() then return end
    Ped.ApplyPreview(Preview.GetPed(), data)
end)

-- ════════════════════════════════════════════════════════════
-- APPARENCE — APPLICATION SUR LE JOUEUR
-- ════════════════════════════════════════════════════════════

exports("Appearance_Apply", function(data)
    Ped.ApplyFullAppearance(PlayerPedId(), data)
end)

exports("Appearance_ApplyClothing", function(components, props)
    Ped.ApplyClothing(PlayerPedId(), components, props)
end)

exports("Appearance_ApplyHair", function(hair)
    Ped.ApplyHair(PlayerPedId(), hair)
end)

exports("Appearance_ApplyTattoos", function(tattoos, clearFirst)
    Ped.ApplyTattoos(PlayerPedId(), tattoos, clearFirst)
end)

exports("Appearance_ApplyOutfit", function(data)
    Ped.ApplyOutfit(data)
end)

-- ════════════════════════════════════════════════════════════
-- DONNÉES
-- ════════════════════════════════════════════════════════════

exports("Character_GetUniqueId", function()
    return State.currentUniqueId
end)

exports("Character_GetCurrentAppearance", function()
    return State.currentAppearance
end)

exports("Character_GetIdentifier", function()
    return State.identifier
end)