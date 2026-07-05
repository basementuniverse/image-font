# Usage Patterns

## Direct Construction

Use this when you already have an atlas image and a character map.

```ts
import { textureAtlas } from '@basementuniverse/texture-atlas';
import { ImageFont } from '@basementuniverse/image-font';

const atlas = textureAtlas(image, {
  relative: true,
  width: 8,
  height: 5,
  regions: {
    A: { x: 0, y: 0 },
    B: { x: 1, y: 0 },
  },
});

const font = new ImageFont(atlas, {
  defaultCharacterConfig: {
    offset: { x: 14, y: 8 },
    width: 32,
    height: 48,
  },
  characters: {
    A: { width: 37 },
    B: { width: 37 },
  },
});
```

## Content Manager Integration

Use this when loading a JSON config that includes atlas tile positions.

```ts
import { imageFontContentProcessor } from '@basementuniverse/image-font';

ContentManager.initialise({
  processors: {
    imageFont: imageFontContentProcessor,
  },
});
```

## Measurement and Drawing

```ts
const size = font.measureText('Hello', { scale: 2, kerning: 1.2 });
font.drawText(ctx, 'Hello', x, y, {
  scale: 2,
  align: 'center',
  baseLine: 'middle',
  color: '#ff0000',
  coloringMode: 'multiply',
});
```

## Layout-Driven Effects

`layoutText` lets you modify glyphs before drawing them.

- Typewriter reveal: toggle `glyph.visible`.
- Per-character animation: update `glyph.offset`, `glyph.scale`, or `glyph.rotation` each frame.
- Colour gradients: assign `glyph.color` per glyph.
- Text on a path: adjust `glyph.position` and `glyph.rotation` before `drawLayout`.

The key rule is that `drawLayout` uses the current glyph state, so you can reuse the same layout object across frames.
