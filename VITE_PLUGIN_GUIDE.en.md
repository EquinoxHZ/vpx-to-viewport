# Vite Plugin VPX - User Guide

## Installation

The plugin is built into the `postcss-vpx-to-vw` package, no additional installation required.

```bash
npm install postcss-vpx-to-vw --save-dev
```

## Basic Usage

### Configure in Vite Project

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import vitePluginVpx from 'postcss-vpx-to-vw/vite-plugin-vpx';

export default defineConfig({
  plugins: [
    vitePluginVpx({
      viewportWidth: 375,
      unitPrecision: 5,
      minPixelValue: 1,
      maxRatio: 1,
      minRatio: 1,
      selectorBlackList: ['.ignore'],
      variableBlackList: ['--ignore-var']
    })
  ]
});
```

## Performance Comparison

### PostCSS Version vs Vite Plugin Standalone Version

| Feature | PostCSS Version | Vite Plugin Version |
|---------|----------------|---------------------|
| Dependency | Requires PostCSS | No PostCSS needed |
| Processing Method | AST Parsing | Regex Matching |
| Performance | Slower (Full CSS parsing) | Fast (Direct string processing) |
| Accuracy | High (Syntax level) | High (Optimized regex) |
| Source Map | Native support | Requires additional integration |
| Compatibility | All build tools | Vite only |

### Benchmark Results

```bash
# Test file: 10,000 lines of CSS with 5,000 vpx units
PostCSS Version:     ~150ms
Vite Plugin Version: ~45ms  (70% improvement)
```

## Configuration Options

All configuration options are identical to the PostCSS version:

```typescript
interface VitePluginVpxOptions {
  // Basic configuration
  viewportWidth?: number;           // Viewport width, default 375
  unitPrecision?: number;           // Precision, default 5
  minPixelValue?: number;           // Minimum conversion threshold, default 1
  
  // Unit ratio configuration
  maxRatio?: number;                // maxvpx pixel value multiplier, default 1
  minRatio?: number;                // minvpx pixel value multiplier, default 1
  clampMinRatio?: number;           // cvpx minimum value multiplier, uses minRatio by default
  clampMaxRatio?: number;           // cvpx maximum value multiplier, uses maxRatio by default
  
  // linear-vpx configuration
  linearMinWidth?: number;          // Linear interpolation minimum viewport width, default 1200
  linearMaxWidth?: number;          // Linear interpolation maximum viewport width, default 1920
  autoClampLinear?: boolean;        // Auto-add clamp to linear-vpx, default true
  
  // Blacklist configuration
  selectorBlackList?: Array<string | RegExp>;     // Selector blacklist
  variableBlackList?: Array<string | RegExp>;     // CSS variable blacklist
  
  // Logging configuration
  logConversions?: boolean;         // Log conversions, default false
  logLevel?: 'silent' | 'info' | 'verbose';  // Log level, default 'info'
  
  // Media query configuration
  mediaQueries?: {
    [key: string]: Partial<VitePluginVpxOptions>;
  };
  
  // File filtering configuration (Vite Plugin only)
  include?: Array<string | RegExp>; // Included files, default CSS/SCSS/LESS/SASS/STYL
  exclude?: Array<string | RegExp>; // Excluded files, default node_modules
}
```

## Advanced Usage

### 1. Multi-Device Adaptation (Media Query Configuration)

```javascript
// vite.config.js
export default defineConfig({
  plugins: [
    vitePluginVpx({
      viewportWidth: 375,  // Mobile default
      mediaQueries: {
        '@media (min-width: 768px)': {
          viewportWidth: 768,
          minRatio: 0.8,
          maxRatio: 1.5
        },
        '@media (min-width: 1920px)': {
          viewportWidth: 1920,
          minRatio: 0.5,
          maxRatio: 2
        }
      }
    })
  ]
});
```

### 2. Custom File Filtering

```javascript
export default defineConfig({
  plugins: [
    vitePluginVpx({
      // Only process style files in src directory
      include: [/src\/.*\.(css|scss|less)$/],
      // Exclude third-party libraries and specific files
      exclude: [/node_modules/, /legacy\.css$/]
    })
  ]
});
```

### 3. Use with Vue/React

```javascript
// vite.config.js (Vue)
import vue from '@vitejs/plugin-vue';
import vitePluginVpx from 'postcss-vpx-to-vw/vite-plugin-vpx';

export default defineConfig({
  plugins: [
    vitePluginVpx({
      viewportWidth: 375,
      include: [/\.vue$/, /\.css$/]  // Process <style> in .vue files
    }),
    vue()
  ]
});
```

```javascript
// vite.config.js (React)
import react from '@vitejs/plugin-react';
import vitePluginVpx from 'postcss-vpx-to-vw/vite-plugin-vpx';

export default defineConfig({
  plugins: [
    vitePluginVpx({
      viewportWidth: 375,
      include: [/\.css$/, /\.module\.css$/]
    }),
    react()
  ]
});
```

### 4. Development Environment Debugging

```javascript
export default defineConfig({
  plugins: [
    vitePluginVpx({
      viewportWidth: 375,
      logConversions: true,
      logLevel: 'verbose'  // Output detailed conversion info
    })
  ]
});
```

## Migration Guide

### Migrating from PostCSS Version

```javascript
// Before: PostCSS configuration
export default defineConfig({
  css: {
    postcss: {
      plugins: [
        require('postcss-vpx-to-vw')({
          viewportWidth: 375
        })
      ]
    }
  }
});

// After: Vite Plugin standalone version
import vitePluginVpx from 'postcss-vpx-to-vw/vite-plugin-vpx';

export default defineConfig({
  plugins: [
    vitePluginVpx({
      viewportWidth: 375
    })
  ]
});
```

### Which Version to Use?

**Use PostCSS Version:**
- ✅ Need compatibility with other build tools (Webpack, Rollup, etc.)
- ✅ Need accurate Source Map support
- ✅ Project already has complete PostCSS configuration
- ✅ Need to work with other PostCSS plugins

**Use Vite Plugin Version:**
- ✅ Pure Vite project, pursuing ultimate performance
- ✅ Don't need complex PostCSS ecosystem
- ✅ Large projects, build speed sensitive
- ✅ Simplify configuration, reduce dependencies

## Common Issues

### Q: Why aren't some files being converted?

A: Check `include` and `exclude` configuration to ensure files are within processing range:

```javascript
vitePluginVpx({
  include: [/\.css$/, /\.vue$/, /\.jsx$/],
  exclude: [/node_modules/]
})
```

### Q: How to handle CSS Modules?

A: CSS Modules are automatically processed, no extra configuration needed:

```javascript
// Button.module.css
.button {
  width: 100vpx;  // ✅ Will be converted
}
```

### Q: Can it be used with other CSS preprocessors?

A: Yes, the plugin executes after preprocessors:

```javascript
// Processing order: SCSS -> Vite Plugin VPX -> Browser
export default defineConfig({
  plugins: [
    vitePluginVpx()
  ],
  css: {
    preprocessorOptions: {
      scss: {
        // SCSS configuration
      }
    }
  }
});
```

### Q: Performance optimization suggestions?

A: 
1. Use `include` to precisely specify files to process
2. Exclude unnecessary directories (like `node_modules`)
3. Turn off `logConversions` in production builds

```javascript
vitePluginVpx({
  include: [/src\/.*\.css$/],
  exclude: [/node_modules/, /public/],
  logConversions: process.env.NODE_ENV === 'development'
})
```

## Example Project

View the complete example:

```bash
# Clone repository
git clone https://github.com/EquinoxHZ/vpx-to-viewport.git
cd vpx-to-viewport/examples/vite-plugin-example

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Contributing

Issues and Pull Requests are welcome!

## License

MIT License
