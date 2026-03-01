# Game Component: Image Font

Render text using image fonts in your game.

## Installation

```bash
npm install @basementuniverse/image-font
```

## How to use

![Image Font Example](./image-font-example.png)

We can initialise an image font with a texture atlas and some configuration data:

```ts
import { textureAtlas } from '@basementuniverse/texture-atlas';
import { ImageFont } from '@basementuniverse/image-font';

let font: ImageFont | null = null;

const image = new Image();
image.src = './image-font.png';
image.onload = () => {
  const atlas = textureAtlas(
    image,
    {
      relative: true,
      width: 8,
      height: 5,
      regions: {
        'A': { x: 0, y: 0 },
        'B': { x: 1, y: 0 },
        'C': { x: 2, y: 0 },
        // ...etc.
      },
    }
  );

  font = new ImageFont(
    atlas,
    {
      defaultCharacterConfig: {
        offset: { x: 14, y: 8 },
        width: 32,
        height: 48,
      },
      characters: {
        'A': { width: 37 },
        'B': { width: 37 },
        'C': { width: 33 },
        // ...etc.
      }
    }
  );
};
```

Or we can use a content processor:

```ts
import { imageFontContentProcessor } from '@basementuniverse/image-font';
import ContentManager from '@basementuniverse/content-manager';

ContentManager.initialise({
  processors: {
    imageFont: imageFontContentProcessor,
  },
});

ContentManager.load([
  {
    name: 'font-spritesheet',
    type: 'image',
    args: ['./image-font.png'],
  },
  {
    name: 'font',
    type: 'json',
    args: [
      // Path to .json or inline JSON:
      {
        textureAtlasSize: { x: 8, y: 5 },
        defaultCharacterConfig: {
          offset: { x: 14, y: 8 },
          width: 32,
          height: 48,
        },
        characters: {
          'A': { textureAtlasPosition: { x: 0, y: 0 }, width: 37 },
          'B': { textureAtlasPosition: { x: 1, y: 0 }, width: 37 },
          'C': { textureAtlasPosition: { x: 2, y: 0 }, width: 33 },
          // ...etc.
        }
      }
    ],
    processors: [
      {
        name: 'imageFont',
        args: ['font-spritesheet'],
      },
    ],
  },
]);

// ContentManager.get('font') returns an ImageFont instance
```

Then we can use the `ImageFont` instance to measure and render text:

```ts
// Measure text
const textSize = font.measureText('ABC', options);

// Render text
font.drawText(context, 'ABC', 0, 0, options);
```

See './example/example.html' for a full example.

## ImageFont configuration

```ts
type ImageFontConfig = {
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
  defaultCharacterConfig?: ImageFontCharacterConfig;

  /**
   * Per-character configuration
   */
  characters: Record<string, ImageFontCharacterConfig>;
};

type ImageFontCharacterConfig = {
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
```

## Image Font content data

When using a content processor, the configuration data for an image font is the same as the `ImageFontConfig` type, but with an additional `textureAtlasSize: vec2` property, containing the size of the texture atlas in tiles.

Also, each character configuration should have a `textureAtlasPosition: vec2` property, containing the tile address of the character in the texture atlas.

## Rendering and measuring options

```ts
type OverflowMode = 'word-wrap' | 'character-wrap' | 'hidden' | 'ellipsis' | 'none';

type ImageFontRenderingOptions = {
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
   * overflow option. Alignment works correctly regardless of maxWidth.
   *
   * If not specified, text will not be wrapped or clipped.
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
   * The height of each line in pixels (pre-scale), scaled by the active scale
   * factor
   *
   * If not specified, defaults to the tallest character defined in the font,
   * giving consistent line spacing regardless of the actual string content.
   */
  lineHeight?: number;
};
```

### Multi-line text example

```ts
// Word-wrap within 200px, with custom line height
font.drawText(context, 'HELLO WORLD THIS IS A LONG STRING', x, y, {
  maxWidth: 200,
  overflow: 'word-wrap',
  lineHeight: 50,
  align: 'center',
  baseLine: 'top',
});

// Truncate with ellipsis
font.drawText(context, 'HELLO WORLD', x, y, {
  maxWidth: 100,
  overflow: 'ellipsis',
  ellipsisString: '...',
});

// measureText respects wrapping and returns the actual rendered bounding box
const size = font.measureText('HELLO WORLD', { maxWidth: 100, overflow: 'word-wrap' });
```

## Utility scripts

It can be rather tedious creating data for large image-fonts with lots of characters, so I vibe-coded a utility script to help with that in './example/generate-data.html'.

You will need to run this using [http-server](https://www.npmjs.com/package/http-server) or a similar tool to serve the HTML file, because it loads images and renders/processes them using a canvas; your browser will complain about this if you open the HTML file directly.

We also have a script './example/rescale.js' which re-scales sizes and offsets in a configuration JSON file by a given factor, which is useful if you want to change the size of an existing font texture atlas without having to manually edit all the values.
