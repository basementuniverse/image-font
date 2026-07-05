---
name: basementuniverse-image-font
description: >
  Use when working with @basementuniverse/image-font to render text from image-based fonts, build or consume texture-atlas-backed fonts, or integrate imageFontContentProcessor with Content Manager.
---

# Basement Universe Image Font

Use this skill when working with @basementuniverse/image-font.

This library renders text to HTML5 Canvas using texture atlases and per-character configuration. It supports direct construction from a texture atlas, Content Manager integration, text measurement, and mutable glyph layouts for per-character effects.

## When to Use

- Loading or configuring an image font for canvas rendering.
- Measuring or drawing text with ImageFont.
- Using layoutText and drawLayout for per-character animation, revealing, paths, or colour effects.
- Wiring imageFontContentProcessor into Content Manager workflows.

## What It Exports

- ImageFont for measuring and drawing text.
- imageFontContentProcessor for Content Manager integration.
- isImageFontConfigData for validating config payloads.
- ImageFontConfig, ImageFontConfigData, ImageFontCharacterConfig, ImageFontCharacterConfigData.
- ImageFontRenderingOptions, GlyphLayout, GlyphInfo, ColoringMode, OverflowMode.

## Working Notes

- The public rendering flow is measureText, layoutText, drawLayout, and drawText.
- layoutText returns mutable glyph metadata; drawLayout reads the current glyph state at render time.
- Per-glyph color overrides the layout color, while colouring mode and colouring function still come from the layout options.
- Missing atlas textures do not draw, but glyph layout still preserves index alignment.

## References

- Public API surface: [references/api.md](references/api.md)
- Type reference: [references/types.md](references/types.md)
- Usage patterns: [references/usage.md](references/usage.md)
