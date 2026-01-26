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
export type ImageFontRenderingOptions
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
Renders text to canvas at specified position with optional rendering options.

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
  align?: 'left'|'center'|'right'         // Horizontal alignment relative to x
  baseLine?: 'top'|'middle'|'bottom'      // Vertical alignment relative to y
  color?: string                           // Color to apply (CSS color string)
  coloringMode?: ColoringMode              // How to apply color (default: 'multiply')
  coloringFunction?: (context: CanvasRenderingContext2D, texture: HTMLCanvasElement, color: string) => void  // Custom coloring when mode='custom'
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

## Key Behaviors

- Character iteration uses grapheme clusters (supports multi-byte chars)
- Missing characters in texture atlas skip rendering but advance x position
- Width calculation excludes kerning for last character
- Actual scale = `options.scale * config.scale`
- Monospace mode: `kerning` specifies pixel spacing; undefined uses tile width
- Proportional mode: `kerning` multiplies per-character widths (default: 1)
- Color cache (LRU, max 1000 entries) per character+color+mode combination
- All positions/offsets measured in pixels
- Texture atlas positions measured in tiles
- `vec2` is `{x: number, y: number}` from `@basementuniverse/vec`

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
