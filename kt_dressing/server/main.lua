-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- KT_DRESSING — SERVER MAIN
--
-- FIX : ce fichier relayait "kt_dressing:getOutfits/saveOutfit/deleteOutfit"
-- vers des events "kt_character:*_internal" inexistants (aucun handler
-- correspondant côté kt_character) — la gestion des tenues ne faisait donc
-- strictement rien.
--
-- Le client (kt_dressing/client/main.lua) appelle désormais directement
-- les vrais events réseau de kt_character (kt_character:getOutfits,
-- kt_character:saveOutfit, kt_character:deleteOutfit), qui font déjà leurs
-- propres vérifications de propriété côté kt_character. Ce fichier n'a
-- donc plus besoin de relayer quoi que ce soit.
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

print("[kt_dressing] server chargé (délégation directe à kt_character)")