# Public API Surface

This package exposes a small runtime API centered on one class and one processor.

## ImageFont

Construct an instance from a texture atlas and font config.

```ts
new ImageFont(textures: TextureAtlasMap, config: ImageFontConfig)
```

### Methods

- `measureText(text, options?) -> vec2`
  - Returns the rendered width and height in canvas pixels.
- `layoutText(text, x, y, options?) -> GlyphLayout`
  - Computes the glyph layout without drawing.
- `drawLayout(context, layout) -> void`
  - Draws a previously computed layout and honours per-glyph overrides.
- `drawText(context, text, x, y, options?) -> void`
  - Convenience wrapper that computes and draws in one step.

## imageFontContentProcessor

```ts
imageFontContentProcessor(content, data, imageName): Promise<void>
```

Use this with Content Manager JSON data that includes `textureAtlasSize` and per-character `textureAtlasPosition` values. The processor:

- validates the JSON payload with `isImageFontConfigData`
- looks up the image by `imageName`
- builds a texture atlas from the sprite sheet and tile map
- stores an `ImageFont` instance back into `content[data.name]`

## isImageFontConfigData

```ts
isImageFontConfigData(value: unknown): value is ImageFontConfigData
```

Use this to validate untyped config payloads before constructing an ImageFont or passing data into the content processor.

## Practical Behaviour

- `drawLayout` skips glyphs whose `visible` flag is false.
- Glyphs without a texture atlas entry are kept in layout data but are not drawn.
- Per-glyph `offset`, `scale`, `rotation`, `pivot`, `alpha`, `color`, `preDraw`, and `postDraw` are applied at draw time.
- `layoutText` and `drawText` share the same layout logic, so modified layouts render consistently.
