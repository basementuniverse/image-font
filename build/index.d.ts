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
     * Get the width of a string of text when rendered with this font
     */
    measureText(text: string, options?: ImageFontRenderingOptions): vec2;
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
