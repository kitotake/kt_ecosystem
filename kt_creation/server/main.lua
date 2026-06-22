-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- KT_CREATION — SERVER MAIN
--
-- FIX : ce fichier relayait "kt_creation:createCharacter" vers un event
-- "kt_character:createCharacter_internal" qui n'a jamais existé (aucun
-- AddEventHandler/RegisterNetEvent ne le gère où que ce soit) — le callback
-- n'était donc jamais invoqué et le wizard restait bloqué indéfiniment.
--
-- Le client (kt_creation/client/main.lua) déclenche désormais directement
-- l'event réseau réel "kt_character:characterCreated", géré par
-- union/server/modules/character/manager/characterManager.lua, qui crée
-- le personnage ET le sélectionne/spawn. Ce fichier n'a donc plus besoin
-- de relayer quoi que ce soit pour la création.
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

print("[kt_creation] server chargé (délégation directe à kt_character:characterCreated)")