fx_version 'cerulean'
game 'gta5'

name        'kt_dressing'
author      'kitotake'
description 'KT Dressing — Gestion des tenues sauvegardées. Utilise kt_character.'
version     '1.0.0'

dependencies { 'kt_character' }

ui_page 'web/dist/index.html'
files {
    'web/dist/index.html',
    'web/dist/assets/*.js',
    'web/dist/assets/*.css',
}

client_scripts { 'client/main.lua' }
server_scripts { 'server/main.lua' }
