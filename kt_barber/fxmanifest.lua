fx_version 'cerulean'
game 'gta5'

name        'kt_barber'
author      'kitotake'
description 'KT Barber — Salon de coiffure. Preview et sauvegarde via kt_character.'
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
