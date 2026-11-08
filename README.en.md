# Paint

A simple drawing program: brush, eraser, lines, rectangles, ellipses, fill, colour picker, text and selection, with undo, zoom, rotation, mirror, crop, resize and filters. Images open and save as PNG, JPEG or WebP.

*Version française : [README.md](README.md)*

## Tools

Each tool has its own key:

- **Brush** (B) and **Eraser** (E): draw or erase freehand.
- **Line** (L), **Rectangle** (R) and **Ellipse** (O): drag out the shape. With **Filled shapes**, rectangles and ellipses are filled.
- **Fill** (F): fills an area of the same colour.
- **Picker** (I): takes the colour of a point in the image.
- **Text** (T): writes text where you click; its size is 4 times the brush size.
- **Selection** (S): picks a rectangular area. **Delete** clears it, **Escape** cancels it.

**Colour** and **Size** are set in the side panel. **Sharp mode (no smoothing)** draws square by square, with crisp edges, for small images and icons.

## Editing the image

- **Undo** (Ctrl+Z) and **Redo** (Ctrl+Y), up to 40 steps.
- **Zoom** in and out (or Ctrl + scroll wheel).
- **Rotate** left or right, **mirror** horizontally or vertically.
- **Crop**: keeps only the selected area.
- **Resize**: new width in px, the height follows.
- **Filters**: black and white, sepia, negative, brighter, darker, more contrast, vivid colours, blur, neon tint.

## Opening and saving

- **New**: an empty image of the chosen size (for example 800 x 600, or 256 x 256 for an icon).
- **Open…**, or drag an image onto the canvas.
- **Save…** (Ctrl+S): as PNG, JPEG or WebP. An opened image is offered as "name (modifié).png" so the original is not overwritten; a new drawing goes to your Pictures folder.

The plugin asks for confirmation before replacing an image that has not been saved yet.

## Data and sync

The plugin keeps nothing itself: your drawings are image files on your PC, wherever you save them.

## Install

In NeoDex: **NeoStore → Discover → Paint → Install**.

Building a plugin: see the [NeoDex SDK](https://github.com/NDesumeur/neodex-sdk).
