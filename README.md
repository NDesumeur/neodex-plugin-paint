# Paint

Un logiciel de dessin simple : pinceau, gomme, lignes, rectangles, ellipses, remplissage, pipette, texte et sélection, avec annulation, zoom, rotation, miroir, recadrage, redimensionnement et filtres. Les images s'ouvrent et s'enregistrent en PNG, JPEG ou WebP.

*English version: [README.en.md](README.en.md)*

## Les outils

Chaque outil a sa lettre au clavier :

- **Pinceau** (B) et **Gomme** (E) : dessiner ou effacer à main levée.
- **Ligne** (L), **Rectangle** (R) et **Ellipse** (O) : tirer la forme au glisser. Avec **Formes pleines**, rectangles et ellipses sont remplis.
- **Remplir** (F) : remplit une zone de la même couleur.
- **Pipette** (I) : prend la couleur d'un point de l'image.
- **Texte** (T) : écrit un texte à l'endroit cliqué ; sa taille vaut 4 fois celle du pinceau.
- **Sélection** (S) : choisit une zone rectangulaire. **Suppr** l'efface, **Échap** l'annule.

**Couleur** et **Taille** se règlent dans le panneau de côté. Le **mode net (sans lissage)** dessine case par case, aux bords francs, pour les petites images et les icônes.

## Modifier l'image

- **Annuler** (Ctrl+Z) et **Rétablir** (Ctrl+Y), jusqu'à 40 étapes.
- **Zoom** avant et arrière (ou Ctrl + molette).
- **Tourner** à gauche ou à droite, **miroir** horizontal ou vertical.
- **Recadrer** : garde seulement la zone sélectionnée.
- **Redimensionner** : nouvelle largeur en px, la hauteur suit.
- **Filtres** : noir et blanc, sépia, négatif, plus lumineux, plus sombre, plus de contraste, couleurs vives, flou, teinte néon.

## Ouvrir et enregistrer

- **Nouveau** : une image vide de la taille choisie (par exemple 800 x 600, ou 256 x 256 pour une icône).
- **Ouvrir…**, ou glisse une image sur la zone de dessin.
- **Enregistrer…** (Ctrl+S) : en PNG, JPEG ou WebP. Une image ouverte est proposée sous « nom (modifié).png » pour ne pas écraser l'originale ; un nouveau dessin va dans ton dossier Images.

Le plugin demande confirmation avant de remplacer une image pas encore enregistrée.

## Données et synchronisation

Le plugin ne garde rien lui-même : tes dessins sont des fichiers image sur ton PC, là où tu les enregistres.

## Installer

Dans NeoDex : **NeoStore → À découvrir → Paint → Installer**.

Développer un plugin : voir le [SDK NeoDex](https://github.com/NDesumeur/neodex-sdk).
