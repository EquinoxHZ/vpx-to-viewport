# PostCSS VPX to VW Plugin

[中文版](README.md) | English

A custom PostCSS plugin that automatically converts `vpx`, `maxvpx`, `minvpx`, and `cvpx` units to corresponding `vw` units and CSS functions.

## Features

- 🔄 Convert `vpx` units to `vw` units
- 📏 Convert `maxvpx` units to `max(vw, Npx)` function (sets minimum bounds)
- 📐 Convert `minvpx` units to `min(vw, Npx)` function (sets maximum bounds)
- 🔒 Convert `cvpx` units to `clamp(minPx, vw, maxPx)` function (sets responsive range bounds)
- 🎯 Support selector and CSS variable blacklists
- ⚙️ Configurable viewport width and precision
- 🔧 Support minimum conversion threshold
- 📊 Conversion logging with multiple levels (silent, info, verbose)

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
      // clampMinRatio and clampMaxRatio will automatically use minRatio and maxRatio values
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
          // clampMinRatio and clampMaxRatio will automatically use minRatio and maxRatio values
          selectorBlackList: ['.ignore'],
          variableBlackList: ['--ignore-var']
        })
      ]
    }
  }
});
```

## Multi-Device Adaptation Support

The plugin provides two multi-device adaptation solutions. You can choose the appropriate solution based on your project needs:

### Solution 1: Multiple Plugin Instances (For Component-Level Adaptation)

By registering multiple plugin instances, you can simultaneously support viewport conversions for different devices. This solution is suitable for scenarios where you need to create dedicated components or styles for different devices:

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

**Usage Example:**
```css
/* Create dedicated styles for different devices */
.m-header {
  height: 120vpx; /* Mobile: 32vw */
}

.t-header {
  height: 120vpx; /* Tablet: 15.625vw */
}

.d-header {
  height: 120vpx; /* Desktop: 6.25vw */
}
```

### Solution 2: Media Query Configuration (For Responsive Design)

By configuring different conversion parameters for different media queries, you can make one set of style code adapt to multiple devices. This solution is more suitable for responsive design:

```javascript
require('postcss-vpx-to-vw')({
  // Default configuration (mobile)
  viewportWidth: 375,
  unitPrecision: 5,
  maxRatio: 1,
  minRatio: 1,
  
  // Media query specific configurations
  mediaQueries: {
    // Tablet configuration
    '@media (min-width: 768px)': {
      viewportWidth: 768,
      unitPrecision: 2,
      maxRatio: 1.5,
      minRatio: 0.9
    },
    
    // Desktop configuration
    '@media (min-width: 1024px)': {
      viewportWidth: 1024,
      maxRatio: 2.0,
      minRatio: 1.0
    },
    
    // Small screen configuration
    '@media (max-width: 480px)': {
      viewportWidth: 320,
      unitPrecision: 4,
      minPixelValue: 0.5
    }
  }
})
```

**Usage Example:**
```css
/* Input: One codebase adapts to multiple devices */
.container {
  width: 300vpx;
  height: 200maxvpx;
}

@media (min-width: 768px) {
  .container {
    width: 300vpx;
    height: 200maxvpx;
  }
}

/* Output: Automatically adapts to different devices */
.container {
  width: 80vw;                    /* Mobile: 300/375*100 = 80vw */
  height: max(53.33333vw, 200px); /* Mobile default configuration */
}

@media (min-width: 768px) {
  .container {
    width: 39.06vw;               /* Tablet: 300/768*100 = 39.06vw */
    height: max(26.04vw, 300px);  /* Tablet: maxRatio=1.5 */
  }
}
```

#### Comparison of Two Solutions

| Feature | Multiple Plugin Instances | Media Query Configuration |
|---------|---------------------------|---------------------------|
| **Use Case** | Component-level differentiated design | Responsive unified design |
| **CSS Structure** | Different selectors for different devices | One set of selectors with media queries |
| **Maintenance Cost** | Higher (multiple style sets to maintain) | Lower (one codebase auto-adapts) |
| **Flexibility** | High (fully customizable) | Medium (constrained by media queries) |
| **Bundle Size** | Larger | Smaller |
| **Recommended For** | Projects with large differences between mobile/desktop | Projects mainly focused on responsive adaptation |

#### Media Query Configuration Features

- **Configuration Inheritance**: Media query configurations inherit default configurations, only need to specify options to override
- **Flexible Matching**: Supports exact matching (e.g., `@media (min-width: 768px)`) and fuzzy matching (e.g., `min-width: 768px`)
- **Enhanced Logging**: Logs show which media query and viewport width each conversion uses

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

#### Responsive Range Bounds (cvpx)

The `cvpx` unit converts to `clamp(minPx, vw, maxPx)` function, setting both minimum and maximum boundaries for better responsive control. You can adjust the pixel value multipliers through `clampMinRatio` and `clampMaxRatio` parameters.

```css
/* Input */
.element {
  font-size: 36cvpx;
  padding: 20cvpx;
}

/* Output (based on 375px viewport width, clampMinRatio: 0.5, clampMaxRatio: 2) */
.element {
  font-size: clamp(18px, 9.6vw, 72px);
  padding: clamp(10px, 5.33333vw, 40px);
}

/* Output (based on 375px viewport width, clampMinRatio: 0.3, clampMaxRatio: 3) */
.element {
  font-size: clamp(10.8px, 9.6vw, 108px);
  padding: clamp(6px, 5.33333vw, 60px);
}
```

#### Mixed Usage

```css
/* Input */
.element {
  margin: 10vpx 20maxvpx 15minvpx 25cvpx;
}

/* Output (based on 375px viewport width) */
.element {
  margin: 2.66667vw max(5.33333vw, 20px) min(4vw, 15px) clamp(25px, 6.66667vw, 25px);
}
```

#### Negative Values

The plugin intelligently handles negative values to ensure semantic consistency:

**cvpx negative handling:**
```css
/* Input */
.element {
  margin-left: -20cvpx;
  text-indent: -15cvpx;
}

/* Output (based on 375px viewport width) */
.element {
  margin-left: clamp(-20px, -5.33333vw, -20px);
  text-indent: clamp(-15px, -4vw, -15px);
}
```

**maxvpx/minvpx automatic semantic swapping for negatives:**
```css
/* Input */
.element {
  margin-left: -20maxvpx;  /* User expects: set minimum boundary for negative values */
  margin-right: -15minvpx; /* User expects: set maximum boundary for negative values */
}

/* Output (intelligent semantic swapping) */
.element {
  margin-left: min(-5.33333vw, -20px);  /* Auto-converts to min, maintains minimum boundary semantics */
  margin-right: max(-4vw, -15px);       /* Auto-converts to max, maintains maximum boundary semantics */
}
```

This intelligent handling eliminates the need for users to manually adjust between `maxvpx` and `minvpx` when working with negative values.

## Configuration Options

The plugin supports the following configuration options:

- `viewportWidth`: Viewport width, default 375px
- `unitPrecision`: Decimal precision, default 5
- `minPixelValue`: Minimum conversion value, default 1px, vpx smaller than this will be converted to px
- `maxRatio`: Pixel value multiplier for maxvpx, default 1
- `minRatio`: Pixel value multiplier for minvpx, default 1
- `clampMinRatio`: Minimum value multiplier for cvpx, defaults to minRatio
- `clampMaxRatio`: Maximum value multiplier for cvpx, defaults to maxRatio
- `selectorBlackList`: Selector blacklist, can be an array of strings or regular expressions
- `variableBlackList`: CSS variable blacklist, can be an array of strings or regular expressions
- `pluginId`: Plugin identifier for distinguishing multiple instances, default 'default'
- `logConversions`: Whether to record conversion logs, default false
- `logLevel`: Log level, options: 'silent', 'info', 'verbose', default 'info'
- `mediaQueries`: Media query specific configurations, set different conversion parameters for different media queries

**Configuration Simplification Note:** If `clampMinRatio` and `clampMaxRatio` are not explicitly set, they will automatically use the values of `minRatio` and `maxRatio`. This way, you only need to configure `minRatio` and `maxRatio` to maintain consistent ratio settings for `maxvpx`, `minvpx`, and `cvpx`.

### Logging Feature

The plugin provides logging functionality to help you understand the conversion process and results:

```javascript
require('postcss-vpx-to-vw')({
  logConversions: true,
  logLevel: 'verbose'  // 'silent', 'info', 'verbose'
})
```

#### Log Level Descriptions

- `silent`: No log output
- `info`: Output basic statistics, showing conversion count by file
- `verbose`: Output detailed conversion information, including specific location and content of each conversion

#### Example Output

**info level**:
```
[postcss-vpx-to-vw] Converted 15 vpx units:
  src/components/Header.vue: 5 conversions
  src/pages/Home.vue: 10 conversions
```

**verbose level**:
```
[postcss-vpx-to-vw] Converted 15 vpx units:
  src/components/Header.vue:25:10 .header { width: 100vpx -> 26.66667vw }
  src/components/Header.vue:26:12 .header { height: 50vpx -> 13.33333vw }
  src/pages/Home.vue:15:8 .container { margin: 20vpx -> 5.33333vw }
  ...
```

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
