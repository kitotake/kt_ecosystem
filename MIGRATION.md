# Guide de migration — v2 → v3

## Ce qui change

### Avant (v2)
- Une seule ressource `kt_character` gère tout
- L'UI React est un monolithe qui gère création + sélection + vêtements
- `preview_client.lua` est un script indépendant non intégré
- La logique d'apparence est dupliquée dans `client/appearance.lua`
- Les events NUI sont enregistrés à plusieurs endroits

### Après (v3)
- `kt_character` = core uniquement (API, natives, BDD)
- Chaque fonctionnalité = ressource indépendante avec son propre NUI
- Preview centralisée via exports
- Un seul endroit pour toute la logique GTA (`client/core/ped.lua`)

---

## Étapes de migration

### Étape 1 — Remplacer kt_character

1. Sauvegarder l'ancien dossier `kt_character/`
2. Copier le nouveau `kt_character/` dans votre dossier resources
3. **Ne pas toucher à la base de données** — le schéma SQL est identique
4. Tester avec `/openselect`

### Étape 2 — Extraire kt_creation

L'UI de création (le React) doit migrer dans `kt_creation/`.

**Dans server.cfg :**
```diff
- ensure kt_character
+ ensure kt_character
+ ensure kt_creation
```

**Events à mettre à jour :**

| Ancien | Nouveau |
|--------|---------|
| `kt_character:openCreator` (client) | Toujours pareil — kt_creation l'écoute |
| `kt_character:createCharacter` (server) | Toujours pareil |
| NUI callback `createCharacter` | Renommer en `character:create` dans kt_creation |

### Étape 3 — Ajouter les ressources boutiques

```cfg
ensure kt_clothing
ensure kt_barber
ensure kt_tattoo
ensure kt_dressing
```

Ouvrir depuis vos zones/markers existants :
```lua
-- Ancien (déclenchait une NUI kt_character)
SendNUIMessage({ type = "openClothing" })

-- Nouveau (ouvre kt_clothing directement)
TriggerClientEvent("kt_clothing:open", src)
-- ou côté client :
TriggerEvent("kt_clothing:open")
```

### Étape 4 — Supprimer preview_client.lua

Le fichier `preview_client.lua` est maintenant intégré dans
`kt_character/client/core/preview.lua`.

Si vous l'aviez en resource séparée, supprimez-le du server.cfg.

---

## Compatibilité des events

Les events suivants sont **conservés** pour la compatibilité :

| Event | Statut |
|-------|--------|
| `kt_appearance:apply` | ✅ Conservé |
| `kt_appearance:update` | ✅ Conservé |
| `kt_character:applyOutfit` | ✅ Conservé |
| `union:spawn:apply` | ✅ Conservé |
| `union:spawn:noCharacters` | ✅ Conservé |
| `kt_character:openCreator` | ✅ Conservé (écouté par kt_creation) |

---

## NUI Callbacks — ce qui change

### kt_creation (nouveau nom des callbacks)

| Ancien (kt_character) | Nouveau (kt_creation) |
|----------------------|----------------------|
| `createCharacter` | `character:create` |
| `update` | `preview:update` |
| `tabChange` | `tabChange` (identique) |
| `cameraControl` | `cameraControl` (identique) |
| `close` | `close` (identique) |

### Supprimés de kt_character

Ces callbacks NUI n'existent plus dans kt_character
(déplacés dans kt_dressing) :

- `saveOutfit`
- `getOutfits`
- `loadOutfit`
- `deleteOutfit`
- `saveAppearance`

---

## Vérification post-migration

Tester dans l'ordre :

1. `ensure kt_character` → vérifier les logs serveur
2. `/creator` → vérifier l'ouverture de kt_creation
3. `/clothing` → vérifier la boutique
4. `/barber` → vérifier le coiffeur
5. `/tattoo` → vérifier le tatoueur
6. `/dressing` → vérifier le dressing
7. Créer un personnage complet
8. Déconnecter et reconnecter → vérifier le rechargement de l'apparence
