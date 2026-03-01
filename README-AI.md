# Image Font Library - AI Documentation

TypeScript library for rendering text using image-based fonts on HTML5 Canvas. Uses texture atlases for character sprites.

## Exports

```typescript
// Main class
export class ImageFont

// Content processor for Content Manager integration
export async function imageFontContentProcessor(content, data, imageName): Promise<void>

// Type guard
export function isImageFontConfigData(value: unknown): value is ImageFontConfigData

// Types
export type ImageFontConfigData
export type ImageFontConfig
export type ImageFontCharacterConfigData
export type ImageFontCharacterConfig
export type ColoringMode
export type OverflowMode
export type ImageFontRenderingOptions
export type GlyphInfo
export type GlyphLayout
```

## ImageFont Class

### Constructor
```typescript
constructor(textures: TextureAtlasMap, config: ImageFontConfig)
```
- `textures`: Map of character strings to HTMLCanvasElement from `@basementuniverse/texture-atlas`
- `config`: Font configuration (see ImageFontConfig type)

### Methods

```typescript
measureText(text: string, options?: ImageFontRenderingOptions): vec2
```
Returns {x: width, y: height} of text in pixels when rendered with given options.

```typescript
drawText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options?: ImageFontRenderingOptions
): void
```
Renders text to canvas at specified position with optional rendering options. Internally calls `_computeLayout` then `drawLayout`.

```typescript
layoutText(
  text: string,
  x: number,
  y: number,
  options?: ImageFontRenderingOptions
): GlyphLayout
```
Runs the same line-splitting, alignment, and cursor-advance logic as `drawText` but returns a `GlyphLayout` instead of drawing. The caller can mutate individual `GlyphInfo` entries before passing the layout to `drawLayout`. Does not draw anything.

```typescript
drawLayout(
  context: CanvasRenderingContext2D,
  layout: GlyphLayout
): void
```
Draws a pre-computed `GlyphLayout`. Iterates `layout.glyphs`, skipping entries where `visible === false`. For each visible glyph, applies per-glyph transforms in this order: `context.save`, `globalAlpha *= alpha`, `translate/rotate/scale` around `pivot` (defaults to glyph centre), `preDraw` callback, resolve effective color (per-glyph `color` overrides `layout.options.color`, same coloringMode/coloringFunction), `drawImage`, `postDraw` callback, `context.restore`. `save`/`restore` is only used when at least one of `alpha`, `rotation`, `scale`, `preDraw`, or `postDraw` is set on the glyph.

## Type Definitions

### ImageFontConfig
```typescript
{
  offset?: vec2                              // Global pixel offset for all characters
  scale?: number                             // Global scale factor (default: 1)
  defaultCharacterConfig?: {                 // Fallback config for undefined characters
    offset?: vec2                            // Character-specific pixel offset
    width?: number                           // Character width in pixels (for kerning)
    height?: number                          // Character height in pixels
  }
  characters: Record<string, ImageFontCharacterConfig>  // Per-character configs
}
```

### ImageFontCharacterConfig
```typescript
{
  offset?: vec2      // Pixel offset from texture atlas tile top-left
  width?: number     // Width in pixels (for kerning/spacing)
  height?: number    // Height in pixels (for measuring)
}
```

### ImageFontConfigData
Extends `ImageFontConfig` for content loading. Differences:
- Adds `textureAtlasSize: vec2` (atlas dimensions in tiles)
- `characters` values must be `ImageFontCharacterConfigData`

### ImageFontCharacterConfigData
Extends `ImageFontCharacterConfig` with:
```typescript
{
  textureAtlasPosition: vec2  // Tile coordinates in atlas (required)
  // ... plus all ImageFontCharacterConfig properties
}
```

### ImageFontRenderingOptions
```typescript
{
  scale?: number                // Rendering scale factor (multiplies font config scale)
  monospace?: boolean           // Use uniform spacing (ignores per-char widths)
  kerning?: number              // Spacing multiplier (0=no space, 1=normal, 2=double) or pixel spacing if monospace
  align?: 'left'|'center'|'right'         // Horizontal alignment relative to x (per-line when multi-line)
  baseLine?: 'top'|'middle'|'bottom'      // Vertical alignment relative to y (applied to total block height)
  color?: string                           // Color to apply (CSS color string)
  coloringMode?: ColoringMode              // How to apply color (default: 'multiply')
  coloringFunction?: (context: CanvasRenderingContext2D, texture: HTMLCanvasElement, color: string) => void  // Custom coloring when mode='custom'
  maxWidth?: number             // Max line width in pixels (pre-scale); enables wrapping/clipping
  overflow?: OverflowMode       // How to handle overflow (default: 'word-wrap')
  ellipsisString?: string       // Ellipsis string when overflow='ellipsis' (default: '...')
  lineHeight?: number           // Line height in pixels (pre-scale, scaled by active scale); defaults to tallest font character
}
```

### GlyphLayout
```typescript
{
  text: string                        // Original input string
  x: number                           // x passed to layoutText
  y: number                           // y passed to layoutText
  options?: ImageFontRenderingOptions // Options used to produce this layout
  bounds: vec2                        // Total bounding box (same as measureText)
  glyphs: GlyphInfo[]                 // One entry per rendered character (post wrap/truncation)
}
```

### GlyphInfo
```typescript
{
  // Read-only computed fields (set by layoutText)
  character: string         // The character
  index: number             // 0-based index in rendered output (post wrap/truncation)
  lineIndex: number         // 0-based line index
  position: vec2            // Top-left draw position in canvas pixels (post-scale, offset applied)
  size: vec2                // Atlas tile size in canvas pixels (post-scale); (0,0) for chars with no texture
  advance: number           // Cursor advance in canvas pixels (includes kerning)
  bounds: { x, y, width, height }  // Same as position + size; useful for hit-testing
  visible: boolean          // false for chars with no atlas texture (e.g. spaces); set false to hide

  // User-modifiable fields (all optional)
  offset?: vec2             // Extra draw offset in canvas pixels, added to position
  scale?: number            // Per-glyph scale multiplier around pivot
  rotation?: number         // Rotation in radians around pivot
  pivot?: vec2              // Pivot for rotation/scale; defaults to glyph centre (post-offset)
  alpha?: number            // Opacity multiplier 0–1; multiplied against context.globalAlpha
  color?: string            // Per-glyph color override; uses layout coloringMode/coloringFunction
  preDraw?: (context: CanvasRenderingContext2D, glyph: GlyphInfo) => void  // After transforms, before draw
  postDraw?: (context: CanvasRenderingContext2D, glyph: GlyphInfo) => void // After draw, before restore
}
```

### ColoringMode
```typescript
type ColoringMode = 'multiply' | 'overlay' | 'hue' | 'custom'
```
- `multiply`: Multiply blend mode preserving transparency
- `overlay`: 50% opacity overlay
- `hue`: Hue blend mode
- `custom`: Uses `coloringFunction` from options (falls back to 'multiply' if not provided)

### OverflowMode
```typescript
type OverflowMode = 'word-wrap' | 'character-wrap' | 'hidden' | 'ellipsis' | 'none'
```
- `word-wrap`: wrap at word (space) boundaries; single words exceeding maxWidth fall back to character-wrap
- `character-wrap`: wrap at character boundaries
- `hidden`: truncate at maxWidth, no indicator
- `ellipsis`: truncate and append `ellipsisString` (default `'...'`)
- `none`: ignore maxWidth, render as single line

## Usage Patterns

### Direct Initialization
```typescript
import { textureAtlas } from '@basementuniverse/texture-atlas';
import { ImageFont } from '@basementuniverse/image-font';

const atlas = textureAtlas(image, {
  relative: true,
  width: 8, height: 5,
  regions: { 'A': {x:0, y:0}, 'B': {x:1, y:0} }
});

const font = new ImageFont(atlas, {
  defaultCharacterConfig: { offset: {x:14, y:8}, width: 32, height: 48 },
  characters: { 'A': {width: 37}, 'B': {width: 37} }
});
```

### Content Manager Integration
```typescript
import { imageFontContentProcessor } from '@basementuniverse/image-font';

// Load sprite sheet as 'font-spritesheet'
// Load JSON with ImageFontConfigData format
// Process with: processors: [{ name: 'imageFont', args: ['font-spritesheet'] }]
// Result: ImageFont instance
```

### Rendering
```typescript
const size = font.measureText('Hello', {scale: 2, kerning: 1.2});
font.drawText(ctx, 'Hello', x, y, {
  scale: 2,
  align: 'center',
  baseLine: 'middle',
  color: '#ff0000',
  coloringMode: 'multiply'
});
```

### Typewriter reveal
```typescript
// Build the layout once:
const layout = font.layoutText('HELLO WORLD', x, y, options);

// Each update tick:
layout.glyphs.forEach((g, i) => { g.visible = i < revealedCount; });

// Each draw tick:
font.drawLayout(ctx, layout);
```

### Per-character wave animation
```typescript
const layout = font.layoutText('WAVE', x, y, options);

// Each draw tick (layout is reused; only offsets change):
layout.glyphs.forEach((g, i) => {
  g.offset = { x: 0, y: Math.sin(Date.now() / 200 + i * 0.5) * 4 };
});
font.drawLayout(ctx, layout);
```

### Per-character colour
```typescript
const layout = font.layoutText('RAINBOW', x, y, options);
const step = 360 / layout.glyphs.length;
layout.glyphs.forEach((g, i) => { g.color = `hsl(${i * step}, 100%, 50%)`; });
font.drawLayout(ctx, layout);
```

### Text along a path
```typescript
const layout = font.layoutText('ON A PATH', 0, 0, options);
let dist = 0;
layout.glyphs.forEach(g => {
  const { point, angle } = samplePath(path, dist + g.advance / 2);
  g.position = { x: point.x - g.size.x / 2, y: point.y - g.size.y / 2 };
  g.rotation = angle;
  dist += g.advance;
});
font.drawLayout(ctx, layout);
```

## Key Behaviors

- Character iteration uses grapheme clusters (supports multi-byte chars)
- Missing characters in texture atlas skip rendering but advance x position
- Width calculation excludes kerning for last character (per line)
- Actual scale = `options.scale * config.scale`
- Monospace mode: `kerning` specifies pixel spacing; undefined uses tile width
- Proportional mode: `kerning` multiplies per-character widths (default: 1)
- Color cache (LRU, max 1000 entries) per character+color+mode combination
- All positions/offsets measured in pixels
- Texture atlas positions measured in tiles
- `vec2` is `{x: number, y: number}` from `@basementuniverse/vec`
- `measureText` with `maxWidth` returns actual rendered bounding box (width = widest line, height = lineHeight × number of lines)
- `lineHeight` default = tallest character height across all font config entries (consistent for any string)
- `align` is applied per-line; `baseLine` is applied to the total text block
- `maxWidth` is a pre-scale value; internally scaled by `options.scale * config.scale`
- `layoutText` / `drawLayout` / `drawText` all produce identical output for unmodified layouts
- `GlyphLayout.glyphs` contains one entry per character in the rendered output (after wrapping/truncation), including spaces and characters with no atlas texture (`visible: false`); index-based effects remain aligned with the original string
- `GlyphInfo.position` and `GlyphInfo.size` already have font scale and render scale baked in; `GlyphInfo.offset` is an additional canvas-pixel nudge layered on top
- Per-glyph `color` overrides `layout.options.color`; `coloringMode` and `coloringFunction` always come from the layout options
- `context.save`/`restore` is only called per glyph when at least one of `alpha`, `rotation`, `scale`, `preDraw`, or `postDraw` is non-undefined — plain layouts have zero overhead
- The layout object is mutable; `drawLayout` reads the current state of each `GlyphInfo` at draw time, so the same layout object can be updated every frame
- `drawLayout` does not re-run layout calculations; modifying `glyph.position` directly (e.g. for path-following) is honoured as-is

## imageFontContentProcessor

```typescript
async function imageFontContentProcessor(
  content: Record<string, {name, type, content, status}>,
  data: {name, type, content, status},
  imageName: string
): Promise<void>
```

Content Manager processor. Expects:
- `data.content`: Valid `ImageFontConfigData`
- `content[imageName].content`: HTMLImageElement
- Validates with `isImageFontConfigData`
- Creates texture atlas from config
- Stores `ImageFont` instance in `content[data.name]`
