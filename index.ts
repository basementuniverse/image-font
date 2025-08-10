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
    if (typeof char !== 'string' || char.length !== 1) {
      return false; // Character keys must be single characters
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
   * Get the width of a string of text when rendered with this font
   */
  public measureText(text: string, options?: ImageFontRenderingOptions): vec2 {
    // When calculating the total width, ignore kerning for the last character
    const lastCharacterWidth = this.measureCharacterWidth(
      text[text.length - 1],
      {
        scale: options?.scale,
      }
    );
    const width =
      text
        .split('')
        .slice(0, text.length - 1)
        .reduce(
          (width, character) =>
            width + this.measureCharacterWidth(character, options),
          0
        ) + lastCharacterWidth;
    const height = Math.max(
      ...text
        .split('')
        .map(character => this.measureCharacterHeight(character, options))
    );
    return vec2(width, height);
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
    const size = this.measureText(text, options);
    let currentX = x;
    switch (options?.align) {
      case 'center':
        currentX -= size.x / 2;
        break;

      case 'right':
        currentX -= size.x;
        break;
    }
    const actualScale = (options?.scale ?? 1) * (this.config.scale ?? 1);
    let actualY = y;
    switch (options?.baseLine) {
      case 'middle':
        actualY = y - size.y / 2;
        break;

      case 'bottom':
        actualY = y - size.y;
        break;
    }
    for (const character of text) {
      const characterWidth = this.measureCharacterWidth(character, options);
      const texture = this.textures[character];
      if (!texture) {
        currentX += characterWidth;
        continue;
      }
      const characterConfig = this.config.characters[character];
      const offset = vec2.add(
        this.config.offset ?? vec2(),
        characterConfig?.offset ??
          this.config.defaultCharacterConfig?.offset ??
          vec2()
      );
      context.drawImage(
        texture,
        currentX - offset.x * actualScale,
        actualY - offset.y * actualScale,
        texture.width * actualScale,
        texture.height * actualScale
      );
      currentX += characterWidth;
    }
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
