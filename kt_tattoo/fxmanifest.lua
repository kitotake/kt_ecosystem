fx_version 'cerulean'
game 'gta5'

name        'kt_tattoo'
author      'kitotake'
description 'KT Tattoo — Salon de tatouage. Preview et sauvegarde via kt_character.'
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
