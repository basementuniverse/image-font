import { textureAtlas, TextureAtlasMap } from '@basementuniverse/texture-atlas';
import { vec2 } from '@basementuniverse/vec';

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

export type ImageFontConfigData = Omit<ImageFontConfig, 'characters'> & {
  /**
   * The size of the texture atlas, measured in tiles
   */
  textureAtlasSize: vec2;

  /**
   * Per-character configuration
   */
  characters: Record<string, ImageFontCharacterConfigData>;
};

export type ImageFontConfig = {
  /**
   * Global offset applied to all characters from top-left of the texture atlas
   * tile, measured in pixels
   */
  offset?: vec2;

  /**
   * Optional scaling factor for the font
   */
  scale?: number;

  /**
   * Default character configuration, used for characters that do not have
   * a specific configuration defined, or for undefined characters
   */
  defaultCharacterConfig?: Omit<
    ImageFontCharacterConfig,
    'textureAtlasPosition'
  >;

  /**
   * Per-character configuration
   */
  characters: Record<string, ImageFontCharacterConfig>;
};

export type ImageFontCharacterConfigData = ImageFontCharacterConfig & {
  /**
   * The tile position of this character in the texture atlas, measured in tiles
   */
  textureAtlasPosition: vec2;
};

export type ImageFontCharacterConfig = {
  /**
   * Offset from the top-left of the texture atlas tile, measured in pixels
   */
  offset?: vec2;

  /**
   * Width of the character in pixels, used for kerning
   *
   * If not specified, use the default width, or the width of the texture atlas
   * tile
   */
  width?: number;

  /**
   * Height of the character in pixels, used for measuring text
   *
   * If not specified, use the default height, or the height of the texture
   * atlas tile
   */
  height?: number;
};

export type ColoringMode = 'multiply' | 'overlay' | 'hue' | 'custom';

export type OverflowMode =
  | 'word-wrap'
  | 'character-wrap'
  | 'hidden'
  | 'ellipsis'
  | 'none';

export type ImageFontRenderingOptions = {
  /**
   * The scale factor to apply to the font when rendering
   */
  scale?: number;

  /**
   * Whether to disable per-character width and draw every character with the
   * same spacing
   *
   * If this is true, the kerning value will be used and measured in pixels
   *
   * If this is true and the kerning value is undefined, use the pixel width
   * of each texture atlas tile
   */
  monospace?: boolean;

  /**
   * The amount of kerning to apply between characters
   *
   * 0 means no spacing between characters, 1 means normal spacing, 2 means
   * double spacing, etc.
   *
   * Default is 1
   */
  kerning?: number;

  /**
   * Horizontal alignment of the text relative to the x position
   *
   * Default is 'left'
   */
  align?: 'left' | 'center' | 'right';

  /**
   * Verticle alignment of the text relative to the baseline
   *
   * Default is 'top'
   */
  baseLine?: 'top' | 'middle' | 'bottom';

  /**
   * Color to apply to the text
   *
   * If not specified, no coloring is applied
   */
  color?: string;

  /**
   * How to apply the color
   *
   * Default is 'multiply'
   */
  coloringMode?: ColoringMode;

  /**
   * Custom coloring function when coloringMode is 'custom'
   *
   * If coloringMode is 'custom' but no function is provided, falls back to
   * 'multiply'
   */
  coloringFunction?: (
    context: CanvasRenderingContext2D,
    texture: HTMLCanvasElement,
    color: string
  ) => void;

  /**
   * Maximum width of the text in pixels (pre-scale)
   *
   * When set, text that exceeds this width will be handled according to the
   * overflow option
   *
   * If not specified, text will not be wrapped or clipped
   */
  maxWidth?: number;

  /**
   * How to handle text that exceeds maxWidth
   *
   * - 'word-wrap': wrap at word boundaries (falls back to character-wrap for
   *   single words that exceed maxWidth)
   * - 'character-wrap': wrap at character boundaries
   * - 'hidden': text is cut off at maxWidth
   * - 'ellipsis': text is cut off and an ellipsis string is appended
   * - 'none': maxWidth is ignored
   *
   * Default is 'word-wrap'
   */
  overflow?: OverflowMode;

  /**
   * The string to use as an ellipsis when overflow is 'ellipsis'
   *
   * Default is '...'
   */
  ellipsisString?: string;

  /**
   * The height of each line in pixels (pre-scale)
   *
   * If not specified, defaults to the tallest character in the font
   * (consistent across all strings in this font)
   */
  lineHeight?: number;
};

// -----------------------------------------------------------------------------
// GLYPH LAYOUT TYPES
// -----------------------------------------------------------------------------

export type GlyphInfo = {
  /**
   * The character this glyph represents
   */
  character: string;

  /**
   * The sequential index of this glyph in the layout (0-based)
   *
   * This is the glyph's position in the rendered output (after any wrapping or
   * truncation applied by the overflow options), not necessarily its index in
   * the original input string
   */
  index: number;

  /**
   * The line index this glyph is on (0-based)
   */
  lineIndex: number;

  /**
   * The top-left draw position of this glyph in canvas pixels
   *
   * Computed from the cursor position minus any configured per-character or
   * global offset, with the font and render scale already applied
   */
  position: vec2;

  /**
   * The size of this glyph's atlas tile in canvas pixels (post-scale)
   *
   * Will be (0, 0) for glyphs that have no texture in the atlas (e.g. spaces)
   */
  size: vec2;

  /**
   * The advance width of this glyph in canvas pixels
   *
   * This is how far the cursor moves after this glyph, including kerning
   */
  advance: number;

  /**
   * The bounding box of this glyph in canvas pixels
   *
   * Equivalent to { x: position.x, y: position.y, width: size.x, height: size.y }.
   * Useful for hit-testing, debug overlays, and path-following calculations
   */
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  /**
   * Whether this glyph should be rendered
   *
   * Automatically false for characters with no texture in the atlas (e.g.
   * spaces). Set this to false manually to hide individual glyphs, e.g. for
   * a typewriter reveal effect
   */
  visible: boolean;

  /**
   * Additional per-glyph draw offset in canvas pixels, applied on top of the
   * computed position
   *
   * Useful for per-character animations such as bobbing, shaking, or
   * path-following nudges
   */
  offset?: vec2;

  /**
   * Per-glyph scale multiplier, applied around the pivot point
   *
   * Multiplied on top of the font and render scale already baked into
   * position and size. Useful for pop-in or emphasis animations
   */
  scale?: number;

  /**
   * Rotation in radians, applied around the pivot point
   *
   * Useful for text-along-a-path or per-character wobble animations
   */
  rotation?: number;

  /**
   * The pivot point for rotation and scale transforms, in canvas pixels
   *
   * Defaults to the centre of the glyph's bounding box (after any per-glyph
   * offset is applied). Set this explicitly for path-following, where each
   * glyph rotates around a specific point on the path
   */
  pivot?: vec2;

  /**
   * Opacity multiplier for this glyph (0–1), multiplied against the context's
   * current globalAlpha at the time drawLayout is called
   *
   * Useful for fade-in typewriter effects or translucent ghost glyphs
   */
  alpha?: number;

  /**
   * Per-glyph color override
   *
   * Overrides the color set in the layout's ImageFontRenderingOptions for this
   * glyph only. The coloringMode and coloringFunction from the layout options
   * are still used
   */
  color?: string;

  /**
   * Called for each glyph immediately before it is drawn, after all canvas
   * transforms (rotation, scale, alpha) have been applied
   *
   * Any context changes made here are isolated to this glyph — the context is
   * saved before and restored after rendering each glyph whenever any
   * per-glyph property (alpha, rotation, scale, preDraw, postDraw) is set
   */
  preDraw?: (context: CanvasRenderingContext2D, glyph: GlyphInfo) => void;

  /**
   * Called for each glyph immediately after it is drawn, before the context
   * is restored
   *
   * Useful for drawing outlines, drop shadows, or debug bounding boxes on top
   * of the glyph
   */
  postDraw?: (context: CanvasRenderingContext2D, glyph: GlyphInfo) => void;
};

export type GlyphLayout = {
  /**
   * The original text string that was laid out
   */
  text: string;

  /**
   * The x position originally passed to layoutText
   */
  x: number;

  /**
   * The y position originally passed to layoutText
   */
  y: number;

  /**
   * The rendering options used to produce this layout
   */
  options?: ImageFontRenderingOptions;

  /**
   * The total bounding box of the laid-out text in canvas pixels
   *
   * Equivalent to the value returned by measureText with the same arguments
   */
  bounds: vec2;

  /**
   * Per-glyph layout information, one entry per character in the rendered
   * output (after wrapping/truncation)
   *
   * Glyphs with no atlas texture (e.g. spaces) are included with
   * visible: false so that index-based effects remain aligned with the string
   */
  glyphs: GlyphInfo[];
};

// -----------------------------------------------------------------------------
// TYPE GUARDS
// -----------------------------------------------------------------------------

export function isImageFontConfigData(
  value: unknown
): value is ImageFontConfigData {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  if (
    !('textureAtlasSize' in value) ||
    typeof value.textureAtlasSize !== 'object' ||
    value.textureAtlasSize === null
  ) {
    return false;
  }
  if (
    !('x' in value.textureAtlasSize) ||
    typeof value.textureAtlasSize.x !== 'number'
  ) {
    return false;
  }
  if (
    !('y' in value.textureAtlasSize) ||
    typeof value.textureAtlasSize.y !== 'number'
  ) {
    return false;
  }
  if ('offset' in value) {
    if (typeof value.offset !== 'object' || value.offset === null) {
      return false;
    }
    if (!('x' in value.offset) || typeof value.offset.x !== 'number') {
      return false;
    }
    if (!('y' in value.offset) || typeof value.offset.y !== 'number') {
      return false;
    }
  }
  if ('scale' in value && typeof value.scale !== 'number') {
    return false;
  }
  if ('defaultCharacterConfig' in value) {
    if (
      typeof value.defaultCharacterConfig !== 'object' ||
      value.defaultCharacterConfig === null
    ) {
      return false;
    }
    if (!isImageFontCharacterConfigData(value.defaultCharacterConfig, false)) {
      return false;
    }
  }
  if (
    !('characters' in value) ||
    typeof value.characters !== 'object' ||
    value.characters === null
  ) {
    return false;
  }
  for (const [char, config] of Object.entries(value.characters)) {
    // Character keys must be single characters / grapheme clusters
    if (typeof char !== 'string' || [...char].length !== 1) {
      return false;
    }
    if (!isImageFontCharacterConfigData(config)) {
      return false;
    }
  }
  return true;
}

function isImageFontCharacterConfigData(
  value: unknown,
  includeTextureAtlasPosition = true
): value is ImageFontCharacterConfig {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  if (includeTextureAtlasPosition) {
    if (
      !('textureAtlasPosition' in value) ||
      typeof value.textureAtlasPosition !== 'object' ||
      value.textureAtlasPosition === null
    ) {
      return false;
    }
    if (
      !('x' in value.textureAtlasPosition) ||
      typeof value.textureAtlasPosition.x !== 'number'
    ) {
      return false;
    }
    if (
      !('y' in value.textureAtlasPosition) ||
      typeof value.textureAtlasPosition.y !== 'number'
    ) {
      return false;
    }
  }
  if ('offset' in value) {
    if (typeof value.offset !== 'object' || value.offset === null) {
      return false;
    }
    if (!('x' in value.offset) || typeof value.offset.x !== 'number') {
      return false;
    }
    if (!('y' in value.offset) || typeof value.offset.y !== 'number') {
      return false;
    }
  }
  if ('width' in value && typeof value.width !== 'number') {
    return false;
  }
  if ('height' in value && typeof value.height !== 'number') {
    return false;
  }
  return true;
}

// -----------------------------------------------------------------------------
// IMAGE FONT CLASS
// -----------------------------------------------------------------------------

export class ImageFont {
  private static readonly MAX_COLOR_CACHE_SIZE = 1000;
  private static readonly DEFAULT_CONFIG: ImageFontConfig = {
    offset: vec2(),
    scale: 1,
    defaultCharacterConfig: {
      offset: vec2(),
    },
    characters: {},
  };

  private textures: TextureAtlasMap;
  private config: ImageFontConfig;

  private colorCache: Map<string, HTMLCanvasElement> = new Map();

  public constructor(textures: TextureAtlasMap, config: ImageFontConfig) {
    this.textures = textures;
    this.config = {
      ...ImageFont.DEFAULT_CONFIG,
      ...config,
      defaultCharacterConfig: {
        ...ImageFont.DEFAULT_CONFIG.defaultCharacterConfig,
        ...config.defaultCharacterConfig,
      },
      characters: {
        ...ImageFont.DEFAULT_CONFIG.characters,
        ...config.characters,
      },
    };
  }

  private getCacheKey(
    character: string,
    color: string,
    mode: ColoringMode
  ): string {
    return `${character}:${color}:${mode}`;
  }

  /**
   * Determine the coloring mode to use, falling back to 'multiply' if needed
   */
  private getColoringMode(options: ImageFontRenderingOptions): ColoringMode {
    const mode = options.coloringMode ?? 'multiply';

    // If mode is 'custom' but no coloring function is provided, we fall back
    // to 'multiply'
    if (mode === 'custom' && !options.coloringFunction) {
      return 'multiply';
    }

    return mode;
  }

  /**
   * Create a colored version of a texture using the specified coloring mode
   */
  private createColoredTexture(
    texture: HTMLCanvasElement,
    color: string,
    mode: ColoringMode,
    coloringFunction?: (
      context: CanvasRenderingContext2D,
      texture: HTMLCanvasElement,
      color: string
    ) => void
  ): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = texture.width;
    canvas.height = texture.height;
    const context = canvas.getContext('2d')!;

    // Draw the original texture
    context.drawImage(texture, 0, 0);

    // Apply coloring based on mode
    switch (mode) {
      case 'multiply':
      case 'hue':
        // Use a second canvas to preserve transparency for multiply/hue modes
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = texture.width;
        tempCanvas.height = texture.height;
        const tempContext = tempCanvas.getContext('2d')!;

        // Draw the character on the temp canvas
        tempContext.drawImage(texture, 0, 0);

        // Apply the color effect (multiply or hue)
        tempContext.globalCompositeOperation = mode;
        tempContext.fillStyle = color;
        tempContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        // Clear the main canvas and draw the colored result using source-atop
        // to preserve the original alpha channel
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(texture, 0, 0);
        context.globalCompositeOperation = 'source-atop';
        context.drawImage(tempCanvas, 0, 0);
        break;

      case 'overlay':
        context.globalCompositeOperation = 'source-atop';
        context.globalAlpha = 0.5;
        context.fillStyle = color;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.globalAlpha = 1.0;
        break;

      case 'custom':
        if (coloringFunction) {
          coloringFunction(context, texture, color);
        }
        break;
    }

    // Reset composite operation
    context.globalCompositeOperation = 'source-over';

    return canvas;
  }

  /**
   * Calculate the width of a single character when rendered with this font
   */
  private measureCharacterWidth(
    character: string,
    options?: ImageFontRenderingOptions
  ): number {
    const characterConfig = this.config.characters[character];
    const actualScale = (options?.scale ?? 1) * (this.config.scale ?? 1);
    const texture = this.textures[character];
    let width = 0;
    if (options?.monospace) {
      if (options?.kerning !== undefined) {
        width = options.kerning;
      } else {
        width =
          this.config.defaultCharacterConfig?.width ?? texture?.width ?? 0;
      }
    } else {
      width =
        (characterConfig?.width ??
          this.config.defaultCharacterConfig?.width ??
          texture?.width ??
          0) * (options?.kerning ?? 1);
    }
    return width * actualScale;
  }

  /**
   * Calculate the height of a single character when rendered with this font
   */
  private measureCharacterHeight(
    character: string,
    options?: ImageFontRenderingOptions
  ): number {
    const characterConfig = this.config.characters[character];
    const actualScale = (options?.scale ?? 1) * (this.config.scale ?? 1);
    return (
      (characterConfig?.height ??
        this.config.defaultCharacterConfig?.height ??
        0) * actualScale
    );
  }

  /**
   * Get the effective line height in scaled pixels
   *
   * If lineHeight is specified in options, it is used (scaled). Otherwise,
   * defaults to the tallest character defined in the font config, which gives
   * consistent line spacing regardless of the actual string being rendered.
   */
  private measureLineHeight(options?: ImageFontRenderingOptions): number {
    if (options?.lineHeight !== undefined) {
      const actualScale = (options?.scale ?? 1) * (this.config.scale ?? 1);
      return options.lineHeight * actualScale;
    }

    // Use the tallest character defined in the font (consistent for any string)
    const actualScale = (options?.scale ?? 1) * (this.config.scale ?? 1);
    const allConfigs = [
      ...Object.values(this.config.characters),
      this.config.defaultCharacterConfig,
    ].filter(Boolean) as ImageFontCharacterConfig[];

    const maxHeight = allConfigs.reduce(
      (max, cfg) => Math.max(max, cfg.height ?? 0),
      0
    );
    return maxHeight * actualScale;
  }

  /**
   * Measure the width of a line of text (without kerning on the last character)
   */
  private measureLineWidth(
    line: string,
    options?: ImageFontRenderingOptions
  ): number {
    if (line.length === 0) {
      return 0;
    }
    const characters = Array.from(line);
    const lastCharacterWidth = this.measureCharacterWidth(
      characters[characters.length - 1],
      { scale: options?.scale }
    );
    return (
      characters
        .slice(0, characters.length - 1)
        .reduce((w, ch) => w + this.measureCharacterWidth(ch, options), 0) +
      lastCharacterWidth
    );
  }

  /**
   * Split text into lines according to maxWidth and overflow mode
   */
  private getLines(
    text: string,
    options?: ImageFontRenderingOptions
  ): string[] {
    // If no maxWidth, or overflow is 'none', return single line
    if (!options?.maxWidth || options?.overflow === 'none') {
      return [text];
    }

    const maxWidth =
      options.maxWidth * (options?.scale ?? 1) * (this.config.scale ?? 1);
    const overflow = options?.overflow ?? 'word-wrap';

    if (overflow === 'hidden') {
      return [this.truncateLine(text, maxWidth, options)];
    }

    if (overflow === 'ellipsis') {
      const ellipsis = options?.ellipsisString ?? '...';
      return [this.truncateLineWithEllipsis(text, maxWidth, ellipsis, options)];
    }

    // word-wrap or character-wrap: build multiple lines
    const lines: string[] = [];

    if (overflow === 'word-wrap') {
      // Split on spaces; re-join words greedily
      const words = text.split(' ');
      let currentLine = '';

      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const candidate =
          currentLine.length > 0 ? currentLine + ' ' + word : word;

        if (this.measureLineWidth(candidate, options) <= maxWidth) {
          currentLine = candidate;
        } else {
          // Flush current line if it has content
          if (currentLine.length > 0) {
            lines.push(currentLine);
            currentLine = '';
          }

          // Check if the single word itself exceeds maxWidth — fall back to
          // character-wrap for that word
          if (this.measureLineWidth(word, options) > maxWidth) {
            const charWrapped = this.characterWrapLine(word, maxWidth, options);
            // All but the last segment become complete lines
            for (let j = 0; j < charWrapped.length - 1; j++) {
              lines.push(charWrapped[j]);
            }
            currentLine = charWrapped[charWrapped.length - 1];
          } else {
            currentLine = word;
          }
        }
      }

      if (currentLine.length > 0) {
        lines.push(currentLine);
      }
    } else {
      // character-wrap
      const charWrapped = this.characterWrapLine(text, maxWidth, options);
      lines.push(...charWrapped);
    }

    return lines.length > 0 ? lines : [''];
  }

  /**
   * Wrap a string at character boundaries to fit within maxWidth (already scaled)
   */
  private characterWrapLine(
    text: string,
    maxWidth: number,
    options?: ImageFontRenderingOptions
  ): string[] {
    const lines: string[] = [];
    const characters = Array.from(text);
    let currentLine = '';

    for (const ch of characters) {
      const candidate = currentLine + ch;
      if (this.measureLineWidth(candidate, options) <= maxWidth) {
        currentLine = candidate;
      } else {
        if (currentLine.length > 0) {
          lines.push(currentLine);
        }
        currentLine = ch;
      }
    }

    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    return lines.length > 0 ? lines : [''];
  }

  /**
   * Truncate a line to fit within maxWidth (already scaled), cutting off overflow
   */
  private truncateLine(
    text: string,
    maxWidth: number,
    options?: ImageFontRenderingOptions
  ): string {
    const characters = Array.from(text);
    let result = '';
    for (const ch of characters) {
      const candidate = result + ch;
      if (this.measureLineWidth(candidate, options) <= maxWidth) {
        result = candidate;
      } else {
        break;
      }
    }
    return result;
  }

  /**
   * Truncate a line to fit within maxWidth (already scaled), appending ellipsis
   */
  private truncateLineWithEllipsis(
    text: string,
    maxWidth: number,
    ellipsis: string,
    options?: ImageFontRenderingOptions
  ): string {
    // If the whole text already fits, no ellipsis needed
    if (this.measureLineWidth(text, options) <= maxWidth) {
      return text;
    }

    const characters = Array.from(text);
    let result = '';
    for (const ch of characters) {
      const candidate = result + ch + ellipsis;
      if (this.measureLineWidth(candidate, options) <= maxWidth) {
        result = result + ch;
      } else {
        break;
      }
    }
    return result + ellipsis;
  }

  /**
   * Compute the glyph layout for a string of text without drawing it
   *
   * This is the internal core shared by layoutText and drawText. It runs the
   * same line-splitting, alignment, and cursor-advance logic, recording each
   * character's final canvas position and metadata into a GlyphLayout instead
   * of drawing immediately.
   */
  private _computeLayout(
    text: string,
    x: number,
    y: number,
    options?: ImageFontRenderingOptions
  ): GlyphLayout {
    const lines = this.getLines(text, options);
    const totalSize = this.measureText(text, options);
    const lineHeight = this.measureLineHeight(options);
    const actualScale = (options?.scale ?? 1) * (this.config.scale ?? 1);

    // Apply baseline (vertical) alignment to the whole text block
    let blockY = y;
    switch (options?.baseLine) {
      case 'middle':
        blockY = y - totalSize.y / 2;
        break;

      case 'bottom':
        blockY = y - totalSize.y;
        break;
    }

    const glyphs: GlyphInfo[] = [];
    let glyphIndex = 0;

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      const lineWidth = this.measureLineWidth(line, options);
      const actualY = blockY + lineIndex * lineHeight;

      // Apply horizontal alignment per line
      let currentX = x;
      switch (options?.align) {
        case 'center':
          currentX = x - lineWidth / 2;
          break;

        case 'right':
          currentX = x - lineWidth;
          break;
      }

      for (const character of line) {
        const characterWidth = this.measureCharacterWidth(character, options);
        const texture = this.textures[character];
        const characterConfig = this.config.characters[character];
        const offset = vec2.add(
          this.config.offset ?? vec2(),
          characterConfig?.offset ??
            this.config.defaultCharacterConfig?.offset ??
            vec2()
        );

        let position: vec2;
        let size: vec2;

        if (texture) {
          position = vec2(
            currentX - offset.x * actualScale,
            actualY - offset.y * actualScale
          );
          size = vec2(
            texture.width * actualScale,
            texture.height * actualScale
          );
        } else {
          position = vec2(currentX, actualY);
          size = vec2(0, 0);
        }

        glyphs.push({
          character,
          index: glyphIndex,
          lineIndex,
          position,
          size,
          advance: characterWidth,
          bounds: {
            x: position.x,
            y: position.y,
            width: size.x,
            height: size.y,
          },
          visible: !!texture,
        });

        currentX += characterWidth;
        glyphIndex++;
      }
    }

    return {
      text,
      x,
      y,
      options,
      bounds: totalSize,
      glyphs,
    };
  }

  /**
   * Get the width of a string of text when rendered with this font
   */
  public measureText(text: string, options?: ImageFontRenderingOptions): vec2 {
    const lines = this.getLines(text, options);
    const lineHeight = this.measureLineHeight(options);

    const width = Math.max(
      ...lines.map(line => this.measureLineWidth(line, options))
    );
    const height = lines.length === 1 ? lineHeight : lineHeight * lines.length;

    return vec2(width, height);
  }

  /**
   * Compute the layout for a string of text without drawing it
   *
   * Returns a GlyphLayout containing per-glyph position, size, and metadata.
   * The layout can be inspected and modified — for example setting per-glyph
   * offset, rotation, scale, alpha, color, or visibility — before being passed
   * to drawLayout to render it.
   *
   * This enables effects such as text along a path, typewriter reveals,
   * per-character colour gradients, and frame-by-frame glyph animations
   * without any breaking changes to the existing drawText API.
   */
  public layoutText(
    text: string,
    x: number,
    y: number,
    options?: ImageFontRenderingOptions
  ): GlyphLayout {
    return this._computeLayout(text, x, y, options);
  }

  /**
   * Draw a pre-computed GlyphLayout on a canvas
   *
   * Iterates the glyphs in the layout and draws each visible one, honouring
   * any per-glyph properties that were set after layoutText was called:
   *
   * - visible    — set to false to skip a glyph (typewriter reveal etc.)
   * - offset     — additional draw offset in canvas pixels
   * - scale      — per-glyph scale multiplier applied around the pivot
   * - rotation   — rotation in radians applied around the pivot
   * - pivot      — pivot point for rotation/scale (defaults to glyph centre)
   * - alpha      — opacity multiplier (0–1)
   * - color      — per-glyph color override
   * - preDraw    — callback invoked after transforms, before drawing
   * - postDraw   — callback invoked after drawing, before context restore
   *
   * The context is saved and restored around each glyph when any of the
   * per-glyph transform properties or callbacks are present.
   */
  public drawLayout(
    context: CanvasRenderingContext2D,
    layout: GlyphLayout
  ): void {
    const options = layout.options;

    for (const glyph of layout.glyphs) {
      if (!glyph.visible) {
        continue;
      }

      const texture = this.textures[glyph.character];
      if (!texture) {
        continue;
      }

      const needsContextSave =
        glyph.alpha !== undefined ||
        glyph.rotation !== undefined ||
        glyph.scale !== undefined ||
        glyph.preDraw !== undefined ||
        glyph.postDraw !== undefined;

      if (needsContextSave) {
        context.save();
      }

      // Apply per-glyph alpha (multiplied against current globalAlpha)
      if (glyph.alpha !== undefined) {
        context.globalAlpha *= glyph.alpha;
      }

      // Resolve final draw position (including optional per-glyph offset)
      const drawX = glyph.position.x + (glyph.offset?.x ?? 0);
      const drawY = glyph.position.y + (glyph.offset?.y ?? 0);

      // Apply rotation and/or per-glyph scale transforms around the pivot
      if (glyph.rotation !== undefined || glyph.scale !== undefined) {
        const pivot =
          glyph.pivot ??
          vec2(drawX + glyph.size.x / 2, drawY + glyph.size.y / 2);
        context.translate(pivot.x, pivot.y);
        if (glyph.rotation !== undefined) {
          context.rotate(glyph.rotation);
        }
        if (glyph.scale !== undefined) {
          context.scale(glyph.scale, glyph.scale);
        }
        context.translate(-pivot.x, -pivot.y);
      }

      // Call preDraw callback (after transforms, before drawing)
      if (glyph.preDraw) {
        glyph.preDraw(context, glyph);
      }

      // Resolve the effective color: per-glyph color overrides the layout color
      const effectiveColor = glyph.color ?? options?.color;
      let finalTexture: HTMLCanvasElement = texture;

      if (effectiveColor) {
        const effectiveOptions: ImageFontRenderingOptions = glyph.color
          ? { ...options, color: glyph.color }
          : (options ?? {});
        const coloringMode = this.getColoringMode(effectiveOptions);
        const cacheKey = this.getCacheKey(
          glyph.character,
          effectiveColor,
          coloringMode
        );

        if (this.colorCache.has(cacheKey)) {
          finalTexture = this.colorCache.get(cacheKey)!;
        } else {
          finalTexture = this.createColoredTexture(
            texture,
            effectiveColor,
            coloringMode,
            effectiveOptions.coloringFunction
          );

          if (this.colorCache.size >= ImageFont.MAX_COLOR_CACHE_SIZE) {
            const firstKey = this.colorCache.keys().next().value;
            if (firstKey !== undefined) {
              this.colorCache.delete(firstKey);
            }
          }

          this.colorCache.set(cacheKey, finalTexture);
        }
      }

      context.drawImage(finalTexture, drawX, drawY, glyph.size.x, glyph.size.y);

      // Call postDraw callback (after drawing, before context restore)
      if (glyph.postDraw) {
        glyph.postDraw(context, glyph);
      }

      if (needsContextSave) {
        context.restore();
      }
    }
  }

  /**
   * Draw text on a canvas using this font
   */
  public drawText(
    context: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    options?: ImageFontRenderingOptions
  ): void {
    this.drawLayout(context, this._computeLayout(text, x, y, options));
  }
}

// -----------------------------------------------------------------------------
// CONTENT PROCESSOR
// -----------------------------------------------------------------------------

/**
 * Content Manager Processor for loading image fonts
 *
 * @see https://www.npmjs.com/package/@basementuniverse/content-manager
 */
export async function imageFontContentProcessor(
  content: Record<
    string,
    {
      name: string;
      type: string;
      content: any;
      status: string;
    }
  >,
  data: {
    name: string;
    type: string;
    content: any;
    status: string;
  },
  imageName: string
): Promise<void> {
  if (!isImageFontConfigData(data.content)) {
    throw new Error('Invalid image font config');
  }

  const image = content[imageName]?.content;
  if (!image) {
    throw new Error(`Image '${imageName}' not found`);
  }

  // Create the texture atlas
  const atlas = textureAtlas(image, {
    relative: true,
    width: data.content.textureAtlasSize.x,
    height: data.content.textureAtlasSize.y,
    regions: Object.fromEntries(
      Object.entries(data.content.characters).map(([char, config]) => [
        char,
        {
          x: config.textureAtlasPosition.x,
          y: config.textureAtlasPosition.y,
        },
      ])
    ),
  });

  // Create the image font
  const font = new ImageFont(atlas, data.content);

  // Store the font in the content manager
  content[data.name] = {
    name: data.name,
    type: 'json',
    content: font,
    status: 'processed',
  };
}
