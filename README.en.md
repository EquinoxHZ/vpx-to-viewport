# PostCSS VPX to VW Plugin

[中文版](README.md) | English

A custom PostCSS plugin that automatically converts `vpx`, `maxvpx`, and `minvpx` units to corresponding `vw` units and CSS functions.

## Features

- 🔄 Convert `vpx` units to `vw` units
- 📏 Convert `maxvpx` units to `max(vw, Npx)` function (sets minimum bounds)
- 📐 Convert `minvpx` units to `min(vw, Npx)` function (sets maximum bounds)
- 🎯 Support selector and CSS variable blacklists
- ⚙️ Configurable viewport width and precision
- 🔧 Support minimum conversion threshold

## Installation

```bash
npm install postcss-vpx-to-vw --save-dev
```

Or using yarn:

```bash
yarn add postcss-vpx-to-vw --dev
```

## Usage

### In PostCSS Configuration

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require('postcss-vpx-to-vw')({
      viewportWidth: 375,
      unitPrecision: 5,
      minPixelValue: 1,
      maxRatio: 1,
      minRatio: 1,
      selectorBlackList: ['.ignore'],
      variableBlackList: ['--ignore-var']
    })
  ]
};
```

### In Vite

```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  css: {
    postcss: {
      plugins: [
        require('postcss-vpx-to-vw')({
          viewportWidth: 375,
          unitPrecision: 5,
          minPixelValue: 1,
          maxRatio: 1,
          minRatio: 1,
          selectorBlackList: ['.ignore'],
          variableBlackList: ['--ignore-var']
        })
      ]
    }
  }
});
```

### Multi-Viewport Support

By registering multiple plugin instances, you can simultaneously support viewport conversions for different devices. This is particularly useful for projects that need to adapt to both mobile and desktop devices:

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    // Mobile plugin - only convert selectors containing .m-
    require('postcss-vpx-to-vw')({
      viewportWidth: 375,
      unitPrecision: 5,
      minPixelValue: 1,
      selectorBlackList: [/^(?!.*\.m-)/], // Only convert selectors containing .m-
      pluginId: 'mobile',
    }),
    // Desktop plugin - only convert selectors containing .d-
    require('postcss-vpx-to-vw')({
      viewportWidth: 1920,
      unitPrecision: 5,
      minPixelValue: 1,
      selectorBlackList: [/^(?!.*\.d-)/], // Only convert selectors containing .d-
      pluginId: 'desktop',
    }),
    // Tablet plugin - only convert selectors containing .t-
    require('postcss-vpx-to-vw')({
      viewportWidth: 768,
      unitPrecision: 5,
      minPixelValue: 1,
      selectorBlackList: [/^(?!.*\.t-)/], // Only convert selectors containing .t-
      pluginId: 'tablet',
    }),
  ],
};
```

### In CSS

In your CSS, you can use `vpx`, `maxvpx`, and `minvpx` units, and the build system will automatically convert them to corresponding values.

### Examples

#### Basic Conversion

```css
/* Input */
.element {
  font-size: 36vpx;
  width: 200vpx;
  margin: 20vpx;
}

/* Output (based on 375px viewport width) */
.element {
  font-size: 9.6vw;
  width: 53.33333vw;
  margin: 5.33333vw;
}
```

#### Minimum Bounds (maxvpx)

`maxvpx` units convert to `max(vw, Npx)` function, ensuring they don't go below specified pixel values on small screens. The pixel value multiplier can be adjusted using the `maxRatio` parameter.

```css
/* Input */
.element {
  font-size: 36maxvpx;
  padding: 20maxvpx;
}

/* Output (based on 375px viewport width, maxRatio: 1) */
.element {
  font-size: max(9.6vw, 36px);
  padding: max(5.33333vw, 20px);
}

/* Output (based on 375px viewport width, maxRatio: 1.5) */
.element {
  font-size: max(9.6vw, 54px);
  padding: max(5.33333vw, 30px);
}
```

#### Maximum Bounds (minvpx)

`minvpx` units convert to `min(vw, Npx)` function, ensuring they don't exceed specified pixel values on large screens. The pixel value multiplier can be adjusted using the `minRatio` parameter.

```css
/* Input */
.element {
  font-size: 36minvpx;
  padding: 20minvpx;
}

/* Output (based on 375px viewport width, minRatio: 1) */
.element {
  font-size: min(9.6vw, 36px);
  padding: min(5.33333vw, 20px);
}

/* Output (based on 375px viewport width, minRatio: 0.8) */
.element {
  font-size: min(9.6vw, 28.8px);
  padding: min(5.33333vw, 16px);
}
```

#### Mixed Usage

```css
/* Input */
.element {
  margin: 10vpx 20maxvpx 15minvpx 25vpx;
}

/* Output (based on 375px viewport width) */
.element {
  margin: 2.66667vw max(5.33333vw, 20px) min(4vw, 15px) 6.66667vw;
}
```

## Configuration Options

The plugin supports the following configuration options:

- `viewportWidth`: Viewport width, default 375px
- `unitPrecision`: Decimal precision, default 5
- `minPixelValue`: Minimum conversion value, default 1px, vpx smaller than this will be converted to px
- `maxRatio`: Pixel value multiplier for maxvpx, default 1
- `minRatio`: Pixel value multiplier for minvpx, default 1
- `selectorBlackList`: Selector blacklist, can be an array of strings or regular expressions
- `variableBlackList`: CSS variable blacklist, can be an array of strings or regular expressions
- `pluginId`: Plugin identifier for distinguishing multiple instances, default 'default'

### Ratio Parameters Explanation

- `maxRatio`: Controls the pixel value multiplier in the `max()` function after `maxvpx` conversion
  - Example: `maxRatio: 1.5` converts `20maxvpx` to `max(5.33vw, 30px)`
  - Use case: When you need larger minimum values on large screens
  - Recommended: 1 - 1.5 (moderately increase minimum values)

- `minRatio`: Controls the pixel value multiplier in the `min()` function after `minvpx` conversion
  - Example: `minRatio: 0.8` converts `20minvpx` to `min(5.33vw, 16px)`
  - Use case: When you need more compact maximum values on small screens
  - Recommended: 0.8 - 1 (moderately reduce maximum values)

## Advantages

1. **Clear semantics**: `vpx` explicitly indicates this value will be converted to viewport units
2. **Flexible configuration**: Can set different viewport widths for different projects
3. **Selector control**: Supports blacklist mechanism, certain selectors can skip conversion
4. **CSS variable support**: Supports independent blacklist control for CSS variables

## Notes

1. The plugin automatically converts during PostCSS processing, no manual operation required
2. Converted values retain specified decimal precision
3. Values smaller than `minPixelValue` will be converted to `px` units
4. Supports mixing `vpx` with other units in one declaration

## License

MIT

## Contributing

Issues and pull requests are welcome.
