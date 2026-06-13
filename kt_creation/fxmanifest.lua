fx_version 'cerulean'
game 'gta5'

name        'kt_creation'
author      'kitotake'
description 'KT Creation — Interface de création de personnage'
version     '1.0.0'

dependencies {
    'kt_character',
}

ui_page 'web/dist/index.html'

files {
    'web/dist/index.html',
    'web/dist/assets/*.js',
    'web/dist/assets/*.css',
    'web/dist/assets/**/*',
}

client_scripts {
    'client/main.lua',
}

server_scripts {
    'server/main.lua',
}
