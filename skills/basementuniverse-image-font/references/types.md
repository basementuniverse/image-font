# Type Reference

## Font Config

### ImageFontConfig

```ts
type ImageFontConfig = {
  offset?: vec2;
  scale?: number;
  defaultCharacterConfig?: Omit<ImageFontCharacterConfig, 'textureAtlasPosition'>;
  characters: Record<string, ImageFontCharacterConfig>;
}
```

### ImageFontConfigData

```ts
type ImageFontConfigData = Omit<ImageFontConfig, 'characters'> & {
  textureAtlasSize: vec2;
  characters: Record<string, ImageFontCharacterConfigData>;
}
```

### ImageFontCharacterConfig

```ts
type ImageFontCharacterConfig = {
  offset?: vec2;
  width?: number;
  height?: number;
}
```

### ImageFontCharacterConfigData

```ts
type ImageFontCharacterConfigData = ImageFontCharacterConfig & {
  textureAtlasPosition: vec2;
}
```

## Rendering Options

### ImageFontRenderingOptions

```ts
type ImageFontRenderingOptions = {
  scale?: number;
  monospace?: boolean;
  kerning?: number;
  align?: 'left' | 'center' | 'right';
  baseLine?: 'top' | 'middle' | 'bottom';
  color?: string;
  coloringMode?: ColoringMode;
  coloringFunction?: (context: CanvasRenderingContext2D, texture: HTMLCanvasElement, color: string) => void;
  maxWidth?: number;
  overflow?: OverflowMode;
  ellipsisString?: string;
  lineHeight?: number;
}
```

### ColoringMode

```ts
type ColoringMode = 'multiply' | 'overlay' | 'hue' | 'custom'
```

### OverflowMode

```ts
type OverflowMode = 'word-wrap' | 'character-wrap' | 'hidden' | 'ellipsis' | 'none'
```

## Layout Types

### GlyphLayout

```ts
type GlyphLayout = {
  text: string;
  x: number;
  y: number;
  options?: ImageFontRenderingOptions;
  bounds: vec2;
  glyphs: GlyphInfo[];
}
```

### GlyphInfo

```ts
type GlyphInfo = {
  character: string;
  index: number;
  lineIndex: number;
  position: vec2;
  size: vec2;
  advance: number;
  bounds: { x: number; y: number; width: number; height: number };
  visible: boolean;
  offset?: vec2;
  scale?: number;
  rotation?: number;
  pivot?: vec2;
  alpha?: number;
  color?: string;
  preDraw?: (context: CanvasRenderingContext2D, glyph: GlyphInfo) => void;
  postDraw?: (context: CanvasRenderingContext2D, glyph: GlyphInfo) => void;
}
```

## Notes

- `position` and `size` already include the active scale.
- `offset` is an extra draw-time nudge layered on top of `position`.
- `bounds` mirrors `position` plus `size` and is useful for hit testing or path-following.
