# KT Character Ecosystem

Architecture modulaire pour la gestion complète du personnage sur FiveM.

---

## Structure

```
kt_ecosystem/
├── kt_character/   ← CORE — ne jamais modifier sans raison
├── kt_creation/    ← Interface création personnage
├── kt_clothing/    ← Boutique vêtements
├── kt_barber/      ← Salon de coiffure
├── kt_tattoo/      ← Salon de tatouage
└── kt_dressing/    ← Gestion tenues personnelles
```

---

## Principe fondamental

**Toutes les ressources parlent uniquement à `kt_character`.**

```
kt_clothing ──exports──► kt_character ──natives──► GTA V
kt_barber   ──exports──► kt_character ──BDD──────► MySQL
kt_tattoo   ──exports──► kt_character
kt_dressing ──exports──► kt_character
kt_creation ──exports──► kt_character
```

Aucune ressource n'appelle directement `SetPedComponentVariation`,
`SetPedHairColor`, `AddPedDecorationFromHashes`, etc.

---

## Ordre de démarrage (server.cfg)

```cfg
ensure oxmysql
ensure union
ensure kt_character   # TOUJOURS EN PREMIER

ensure kt_creation
ensure kt_clothing
ensure kt_barber
ensure kt_tattoo
ensure kt_dressing
```

---

## Exports CLIENT kt_character

### Preview

| Export | Description |
|--------|-------------|
| `Preview_Start(options)` | Démarre la preview (clone ped + caméra) |
| `Preview_Stop()` | Arrête la preview |
| `Preview_Refresh()` | Re-clone depuis l'apparence actuelle |
| `Preview_SetCamera(preset)` | `"face"` `"hair"` `"body"` `"full"` |
| `Preview_CameraAction(action)` | `"rotateLeft"` `"zoomIn"` etc. |
| `Preview_Rotate(degrees)` | Tourne le ped cloné |
| `Preview_IsActive()` | Retourne `true/false` |
| `Preview_GetPed()` | Handle du ped cloné |
| `Preview_PlayAnim(dict, anim)` | Joue une animation |
| `Preview_ResetAnim()` | Remet l'idle |

### Appliquer sur le ped preview (temps réel)

| Export | Description |
|--------|-------------|
| `Preview_ApplyAppearance(data)` | Apparence complète |
| `Preview_ApplyClothing(components, props)` | Vêtements uniquement |
| `Preview_ApplyHair(hair)` | Coiffure uniquement |
| `Preview_ApplyTattoos(tattoos, clearFirst)` | Tatouages uniquement |
| `Preview_ApplyPartial(data)` | Champs optionnels |

### Appliquer sur le joueur

| Export | Description |
|--------|-------------|
| `Appearance_Apply(data)` | Apparence complète |
| `Appearance_ApplyClothing(components, props)` | Vêtements |
| `Appearance_ApplyHair(hair)` | Coiffure |
| `Appearance_ApplyTattoos(tattoos, clearFirst)` | Tatouages |
| `Appearance_ApplyOutfit(data)` | Tenue (components + props) |

### Données

| Export | Description |
|--------|-------------|
| `Character_GetUniqueId()` | UUID du personnage actif |
| `Character_GetCurrentAppearance()` | Apparence complète actuelle |
| `Character_GetIdentifier()` | License du joueur |

---

## Exports SERVER kt_character

| Export | Description |
|--------|-------------|
| `Character_GetUniqueId(src)` | UUID du personnage actif |
| `Character_GetData(src)` | Données complètes |
| `Character_IsActive(src)` | A un personnage actif ? |
| `Character_SaveAppearance(src, data)` | Sauvegarde complète |
| `Character_SaveClothing(src, components, props)` | Vêtements |
| `Character_SaveTattoos(src, tattoos)` | Tatouages |
| `Character_SaveHair(src, hair)` | Coiffure |
| `On(eventName, cb)` | S'abonner à un event interne |
| `Emit(eventName, ...)` | Déclencher un event interne |

---

## Events internes (EventBus)

Ces events sont déclenchés par `kt_character` et peuvent être
écoutés par n'importe quelle ressource via `exports["kt_character"]:On(...)`.

| Event | Déclenchement |
|-------|---------------|
| `kt_character:internal:characterSelected` | Joueur sélectionne un personnage |
| `kt_character:internal:characterSpawned` | Spawn terminé |
| `kt_character:internal:characterCreated` | Nouveau personnage créé |
| `kt_character:internal:appearanceSaved` | Apparence sauvegardée |
| `kt_character:internal:clothingSaved` | Vêtements sauvegardés |
| `kt_character:internal:tattoosSaved` | Tatouages sauvegardés |
| `kt_character:internal:outfitApplied` | Tenue appliquée |

### Exemple d'utilisation depuis une autre ressource

```lua
-- Dans votre ressource (server)
CreateThread(function()
    Wait(500)
    exports["kt_character"]:On(
        "kt_character:internal:characterSelected",
        function(src, characterData)
            print("Joueur " .. src .. " a sélectionné " .. characterData.firstname)
            -- Ex: initialiser l'inventaire, le job, etc.
        end
    )
end)
```

---

## Créer une nouvelle ressource

Exemple minimal pour une ressource **kt_surgery** :

### fxmanifest.lua
```lua
fx_version 'cerulean'
game 'gta5'
dependencies { 'kt_character' }
client_scripts { 'client/main.lua' }
server_scripts { 'server/main.lua' }
```

### client/main.lua
```lua
local function openSurgery()
    -- 1. Démarrer preview
    exports["kt_character"]:Preview_Start({ camera = "face" })

    -- 2. Ouvrir UI + envoyer données actuelles
    SetNuiFocus(true, true)
    SendNUIMessage({
        type = "open",
        currentAppearance = exports["kt_character"]:Character_GetCurrentAppearance()
    })
end

-- Preview temps réel
RegisterNUICallback("preview:update", function(data, cb)
    exports["kt_character"]:Preview_ApplyPartial(data)
    cb("ok")
end)

-- Sauvegarde
RegisterNUICallback("surgery:save", function(data, cb)
    exports["kt_character"]:Appearance_Apply(data)
    TriggerServerEvent("kt_surgery:save", data)
    exports["kt_character"]:Preview_Stop()
    SetNuiFocus(false, false)
    cb("ok")
end)
```

### server/main.lua
```lua
RegisterNetEvent("kt_surgery:save", function(data)
    local src = source
    exports["kt_character"]:Character_SaveAppearance(src, data)
end)
```

---

## Structure frontend recommandée

```
web/src/
├── bridge.ts          ← Seul fichier qui communique avec le Lua
├── store/
│   ├── *.store.ts     ← Zustand stores par domaine
├── pages/
│   └── */             ← Une page par étape/vue
├── components/
│   ├── ui/            ← Atomes (Slider, Field, ColorPicker...)
│   └── character/     ← Composants spécifiques
├── hooks/
│   └── use*.ts        ← Logique métier extraite
└── types/
    └── *.types.ts     ← Types TypeScript
```

---

## Base de données

Toutes les tables sont gérées par `kt_character`.
Les autres ressources **n'ont pas de tables propres** pour les données personnage.

```sql
characters              ← Données de base
user_character          ← Liaison joueur ↔ personnage
character_appearances   ← Apparence (skin, hair, overlays, tattoos)
character_outfits       ← Tenues sauvegardées
```

---

## Résumé des responsabilités

| Ressource | Responsabilité |
|-----------|---------------|
| `kt_character` | Natives GTA, BDD, preview, exports API |
| `kt_creation` | UI création, wizard multi-étapes |
| `kt_clothing` | UI boutique, catalogue vêtements |
| `kt_barber` | UI coiffeur, catalogue coiffures |
| `kt_tattoo` | UI tatoueur, catalogue tatouages |
| `kt_dressing` | UI dressing, gestion tenues perso |
