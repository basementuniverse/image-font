import { TextureAtlasMap } from '@basementuniverse/texture-atlas';
import { vec2 } from '@basementuniverse/vec';
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
    defaultCharacterConfig?: Omit<ImageFontCharacterConfig, 'textureAtlasPosition'>;
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
export type OverflowMode = 'word-wrap' | 'character-wrap' | 'hidden' | 'ellipsis' | 'none';
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
    coloringFunction?: (context: CanvasRenderingContext2D, texture: HTMLCanvasElement, color: string) => void;
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
export declare function isImageFontConfigData(value: unknown): value is ImageFontConfigData;
export declare class ImageFont {
    private static readonly MAX_COLOR_CACHE_SIZE;
    private static readonly DEFAULT_CONFIG;
    private textures;
    private config;
    private colorCache;
    constructor(textures: TextureAtlasMap, config: ImageFontConfig);
    private getCacheKey;
    /**
     * Determine the coloring mode to use, falling back to 'multiply' if needed
     */
    private getColoringMode;
    /**
     * Create a colored version of a texture using the specified coloring mode
     */
    private createColoredTexture;
    /**
     * Calculate the width of a single character when rendered with this font
     */
    private measureCharacterWidth;
    /**
     * Calculate the height of a single character when rendered with this font
     */
    private measureCharacterHeight;
    /**
     * Get the effective line height in scaled pixels
     *
     * If lineHeight is specified in options, it is used (scaled). Otherwise,
     * defaults to the tallest character defined in the font config, which gives
     * consistent line spacing regardless of the actual string being rendered.
     */
    private measureLineHeight;
    /**
     * Measure the width of a line of text (without kerning on the last character)
     */
    private measureLineWidth;
    /**
     * Split text into lines according to maxWidth and overflow mode
     */
    private getLines;
    /**
     * Wrap a string at character boundaries to fit within maxWidth (already scaled)
     */
    private characterWrapLine;
    /**
     * Truncate a line to fit within maxWidth (already scaled), cutting off overflow
     */
    private truncateLine;
    /**
     * Truncate a line to fit within maxWidth (already scaled), appending ellipsis
     */
    private truncateLineWithEllipsis;
    /**
     * Compute the glyph layout for a string of text without drawing it
     *
     * This is the internal core shared by layoutText and drawText. It runs the
     * same line-splitting, alignment, and cursor-advance logic, recording each
     * character's final canvas position and metadata into a GlyphLayout instead
     * of drawing immediately.
     */
    private _computeLayout;
    /**
     * Get the width of a string of text when rendered with this font
     */
    measureText(text: string, options?: ImageFontRenderingOptions): vec2;
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
    layoutText(text: string, x: number, y: number, options?: ImageFontRenderingOptions): GlyphLayout;
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
    drawLayout(context: CanvasRenderingContext2D, layout: GlyphLayout): void;
    /**
     * Draw text on a canvas using this font
     */
    drawText(context: CanvasRenderingContext2D, text: string, x: number, y: number, options?: ImageFontRenderingOptions): void;
}
/**
 * Content Manager Processor for loading image fonts
 *
 * @see https://www.npmjs.com/package/@basementuniverse/content-manager
 */
export declare function imageFontContentProcessor(content: Record<string, {
    name: string;
    type: string;
    content: any;
    status: string;
}>, data: {
    name: string;
    type: string;
    content: any;
    status: string;
}, imageName: string): Promise<void>;
