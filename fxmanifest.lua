fx_version 'cerulean'
game 'gta5'

name 'kt_character'
author 'kitotake'
description 'Character Creator + Appearance (React TSX UI)'
version '2.2.2'

-- FIX : déclarer les dépendances pour garantir l'ordre de démarrage.
-- oxmysql et union doivent être chargés AVANT kt_character.
dependencies {
    'oxmysql',
    'union',
}

ui_page 'web/dist/index.html'

files {
    'web/dist/index.html',
    'web/dist/assets/*.js',
    'web/dist/assets/*.css'
}

-- FIX : ordre explicite des scripts client — appearance et camera AVANT main
-- pour garantir que ApplyFullAppearance, ApplyOutfit, CreateCharacterCam, etc.
-- sont définis avant que main.lua ne les appelle.
client_scripts {
    'client/utils.lua',
    'client/appearance.lua',
    'client/camera.lua',
    'client/main.lua',
}

server_scripts {
    -- Core (ordre important)
    'server/config.lua',
    'server/utils.lua',
    'server/identifiers.lua',
    'server/validator.lua',

    -- Features
    'server/character_create.lua',
    'server/character_load.lua',
    'server/character_skin.lua',
    'server/character_update.lua',
    'server/outfits.lua',
    'server/events.lua',

    -- Main (toujours en dernier)
    'server/main.lua'
}

client_exports {
    "ApplyFullAppearance",
    "ApplyOutfit",
    "ApplyPreview",
}
