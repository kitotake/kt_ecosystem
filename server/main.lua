-- server/main.lua (kt_character)
-- FIX : suppression de la commande charselect qui déclenchait
-- kt_character:openCharSelect, un event inexistant côté client.

CreateThread(function()
    Utils.debug("kt_character chargé correctement", "INFO")
end)
