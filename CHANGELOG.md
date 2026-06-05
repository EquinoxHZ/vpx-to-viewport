# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.8.6] - 2026-06-05

### 🐛 Fixed
- Fixed the **last declaration** in a CSS rule block not being converted in **build** mode (affected `@import`-ed CSS and Vue `<style scoped>` blocks)
- Vite minifies CSS in build mode and drops the trailing semicolon of the last declaration in each block (e.g. `font-size:14vpx}`)
- The declaration-matching regex in `vpx-core.js` required a trailing `;`, so the last declaration was never matched/converted (only surfaced in build, since dev-mode CSS keeps all semicolons)
- Made the trailing semicolon optional (`(;|$)`) for both CSS custom properties and normal declarations, preserving the original terminator
- Verified end-to-end with a real Vue3 SFC: `<style scoped>` with `@import` now converts fully in both dev and build modes

## [1.8.5] - 2026-06-05

### 🐛 Fixed
- Fixed Vite plugin not converting `@import`-ed vpx units in **build** mode (1.8.4 only fixed dev mode)
- In build mode, Vite merges/minifies/emits CSS during Rollup's `generateBundle` stage (via `vite:css-post`), so vpx units inlined by `postcss-import` could not be reliably caught in the transform hook chain
- Added a `generateBundle` hook that re-scans every emitted `.css` asset and converts any remaining vpx units, ensuring full coverage in build output
- The pass is idempotent: already-converted `vw` values no longer match the `vpx` pattern, so no double conversion occurs

## [1.8.4] - 2026-06-03

### 🐛 Fixed
- Fixed Vite plugin not converting vpx units inside CSS files imported via `@import` (e.g. `@import './foo.css'` inside a `<style>` block or another stylesheet)
- Vite's built-in CSS handling uses `postcss-import` to inline `@import` targets directly from disk, bypassing the plugin's `pre` transform stage
- The Vite plugin now also registers a `post`-stage pass that scans CSS modules (`.css/.scss/.sass/.less/.styl` and Vue `<style>` virtual modules) after `@import` inlining, so imported vpx units are converted correctly
- The `post` pass is idempotent: already-converted `vw` values no longer match the `vpx` pattern, so no double conversion occurs

## [1.8.3] - 2026-02-04

### 🐛 Fixed
- Fixed Vite plugin not working in dev mode due to query parameters in file IDs
- Vite adds query parameters like `?direct`, `?used`, `?inline` to file IDs in dev mode
- The `shouldTransform` function now correctly strips query parameters before matching file patterns

## [1.8.0] - 2025-12-08

### 📦 Package Renamed
- **BREAKING**: Package renamed from `postcss-vpx-to-vw` to `vpx-to-viewport`
- Better reflects multi-platform support (PostCSS, Vite, Webpack)
- Old package marked as deprecated on npm with migration notice
- All documentation updated to use new package name

### ✨ Added
- Webpack Loader support (`webpack-loader-vpx.js`)
- TypeScript definitions for Webpack Loader
- Comprehensive Webpack Loader guide (`WEBPACK_LOADER_GUIDE.md`)
- Example project for Webpack Loader
- Cross-platform consistency tests for all three integrations

### 🔧 Refactored
- Extracted shared core logic into `vpx-core.js` (453 lines)
- Reduced code duplication by 41.5% (1,534 → 897 lines)
- PostCSS plugin refactored to use shared core (447 → 190 lines)
- Vite plugin refactored to use shared core (509 → 104 lines)
- All three versions now share the same transformation logic

### 🚀 Performance
- Vite Plugin: 6-9x faster than PostCSS version
- Webpack Loader: 6-9x faster than PostCSS version
- Both direct string processing approaches significantly outperform AST-based PostCSS

### 📚 Documentation
- Updated all installation commands to use `vpx-to-viewport`
- Added migration guide from old package name
- Enhanced keywords for better npm discoverability

### Migration Guide
If you're using the old package name:
```bash
# Uninstall old package
npm uninstall postcss-vpx-to-vw

# Install new package
npm install vpx-to-viewport --save-dev
```

Update your imports:
```javascript
// PostCSS - Old
require('postcss-vpx-to-vw')

// PostCSS - New
require('vpx-to-viewport')

// Vite Plugin - Old
import vitePluginVpx from 'postcss-vpx-to-vw/vite-plugin-vpx'

// Vite Plugin - New
import vitePluginVpx from 'vpx-to-viewport/vite-plugin-vpx'

// Webpack Loader - New
{
  loader: 'vpx-to-viewport/webpack-loader-vpx',
  options: { /* ... */ }
}
```

## [1.6.4] - 2025-12-05

### Added
- VS Code extension published to Marketplace for IntelliSense support
- Extension provides smart completions, hover documentation, and syntax highlighting
- Support for CSS, SCSS, LESS, Vue, JSX, and TSX files in the extension

### Changed
- Updated documentation to reference VS Code extension installation

## [1.6.3] - 2025-12-05

### Changed
- 移除 postinstall 自动配置脚本以及内置的 CSS Custom Data / 代码片段文件，改由 VS Code 扩展提供智能提示
- 在仓库新增 `packages/vpx-vscode-extension`，提供 VPX CSS Helper 扩展源码

### Added
- 更新文档，指导通过扩展获取补全与悬停

## [1.6.2] - 2025-12-05

### Added
- 发布临时版 VS Code 代码片段与 `css.lint.unknownProperties` 配置（现已被扩展取代）

## [1.6.1] - 2025-12-05

### Added
- 发布 postinstall 脚本自动写入 VS Code `css.customData`（现已废弃）

## [1.6.0] - 2025-12-05

### Added
- **线性缩放功能 🆕** - 新增 `linear-vpx()` 函数支持
  - `linear-vpx(minVal, maxVal, minWidth, maxWidth)` 完整形式，支持自定义所有参数
  - `linear-vpx(minVal, maxVal)` 简化形式，使用配置中的默认视口范围
  - 自动生成响应式线性插值的 `calc()` 表达式
  - 可选的 `clamp()` 包裹以限制值的边界范围
  - 支持负数值和小数值，自动处理浮点数精度问题
  - 完全支持媒体查询独立配置
  - 18 个专门的测试用例，覆盖各种使用场景
- **新增配置选项**
  - `linearMinWidth`: linear-vpx 的默认最小视口宽度（默认 1200）
  - `linearMaxWidth`: linear-vpx 的默认最大视口宽度（默认 1920）
  - `autoClampLinear`: 是否自动为 linear-vpx 添加 clamp 限制（默认 true）
- **黑名单支持** - linear-vpx 完全支持选择器和变量黑名单
  - `selectorBlackList` 对 linear-vpx 生效
  - `variableBlackList` 对 linear-vpx 生效
- **演示和文档**
  - 新增 `demo/linear-vpx-demo.js` 演示脚本，包含 8 个实际应用场景
  - 新增 `demo/LINEAR_VPX_GUIDE.md` 完整功能说明文档
  - 更新中英文 README，添加详细的 linear-vpx 使用说明

### Enhanced
- **响应式设计增强** - 线性缩放实现真正的流式布局
  - 属性值随视口宽度平滑过渡，无需定义媒体查询断点
  - 精确控制数值在特定视口区间内的变化范围
  - 可与 vpx、maxvpx、minvpx、cvpx 混合使用
  - 支持字体大小、间距、尺寸等各类属性的线性缩放
- **媒体查询配置扩展** - linearMinWidth、linearMaxWidth、autoClampLinear 可在媒体查询中独立配置
  - 不同媒体查询可使用不同的视口范围
  - 可针对特定媒体查询禁用 clamp 包裹
- **代码优化**
  - 重构黑名单检查逻辑，统一处理所有 vpx 相关功能
  - 改进浮点数精度处理，使用 `toFixed(10)` 解决计算精度问题
  - 优化转换日志记录，linear-vpx 转换同样被完整记录

### Example Usage
```css
/* 基础用法 */
.hero {
  width: linear-vpx(840, 1000, 1200, 1920);
  /* 输出: clamp(840px, calc(840px + 160 * (100vw - 1200px) / 720), 1000px) */
}

/* 简化形式 */
.text {
  font-size: linear-vpx(16, 24);  /* 使用配置默认值 */
}

/* 媒体查询配置 */
require('vpx-to-viewport')({
  linearMinWidth: 375,
  linearMaxWidth: 1920,
  autoClampLinear: true,
  mediaQueries: {
    '@media (min-width: 768px)': {
      linearMinWidth: 768,
      linearMaxWidth: 1440,
      autoClampLinear: false,  // 大屏幕不限制上限
    }
  }
})
```

### Benefits
- 🎯 **无断点响应式**: 属性值随视口连续变化，无需定义多个媒体查询断点
- 📐 **精确控制**: 明确指定属性值在特定视口区间内的变化范围
- 💻 **代码简洁**: 一行代码替代复杂的手写 calc 表达式
- 🔧 **灵活配置**: 支持全局和媒体查询级别的独立配置
- ✅ **类型安全**: 完整的 TypeScript 类型定义

## [1.5.0] - 2025-08-25

### Added
- **媒体查询支持 🆕** - 新增媒体查询特定配置功能
  - `mediaQueries` 配置选项，为不同媒体查询设置不同的转换参数
  - 支持为移动端、平板、桌面等不同设备设置独立的 `viewportWidth`、`unitPrecision`、`maxRatio`、`minRatio` 等配置
  - 配置继承机制：媒体查询配置自动继承默认配置，只需覆盖需要的选项
  - 灵活匹配方式：支持精确匹配（如 `@media (min-width: 768px)`）和模糊匹配（如 `min-width: 768px`）
  - 完整测试覆盖：9个专门的媒体查询功能测试用例，覆盖各种使用场景
- **增强的日志功能** - 媒体查询相关的日志改进
  - 日志现在显示每个转换使用的媒体查询和视口宽度
  - 在 `verbose` 模式下显示具体的媒体查询匹配信息
  - 在 `info` 模式下按媒体查询分组显示转换统计
- **演示和文档** - 完整的媒体查询功能展示
  - 新增 `demo:media-query` 演示脚本，展示响应式设计的实际应用场景

### Enhanced
- **响应式设计支持** - 真正实现多设备适配
  - 移动端优先：默认配置通常基于 375px 视口
  - 平板适配：针对 768px+ 屏幕的优化配置
  - 桌面适配：针对 1024px+ 大屏幕的配置
  - 小屏优化：针对 320px 等超小屏幕的特殊处理
- **更智能的转换** - 根据设备特性自动调整
  - 不同设备使用不同的精度要求
  - 平板和桌面设备可以使用更大的 `maxRatio` 和 `minRatio` 倍数
  - 小屏设备可以使用更精细的 `minPixelValue` 控制

### Example Configuration
```javascript
require('vpx-to-viewport')({
  // 默认配置（移动端）
  viewportWidth: 375,
  unitPrecision: 5,
  maxRatio: 1,
  minRatio: 1,
  
  // 媒体查询特定配置
  mediaQueries: {
    // 平板配置
    '@media (min-width: 768px)': {
      viewportWidth: 768,
      unitPrecision: 2,
      maxRatio: 1.5,
      minRatio: 0.9
    },
    
    // 桌面配置
    '@media (min-width: 1024px)': {
      viewportWidth: 1024,
      maxRatio: 2.0,
      minRatio: 1.0
    },
    
    // 小屏配置
    '@media (max-width: 480px)': {
      viewportWidth: 320,
      unitPrecision: 4,
      minPixelValue: 0.5
    }
  }
})
```

### Breaking Changes
- 无破坏性变更，完全向后兼容
- 如果不配置 `mediaQueries`，插件行为与之前版本完全一致

## [1.4.0] - 2025-08-25

### Added
- **cvpx 单位支持** - 新增 `cvpx` 单位，转换为 `clamp()` 函数
  - `cvpx` 单位转换为 `clamp(minPx, vw, maxPx)` 函数，提供响应式范围边界控制
  - 新增 `clampMinRatio` 配置选项，控制 cvpx 的最小值倍数，默认 0.5
  - 新增 `clampMaxRatio` 配置选项，控制 cvpx 的最大值倍数，默认 2
  - 支持与 vpx、maxvpx、minvpx 混合使用
  - 完整的测试用例覆盖和类型定义
- 新增 `demo:cvpx` 演示脚本，展示 cvpx 功能的各种使用场景
- 更新了 README 文档，包含 cvpx 功能的详细说明和示例

### Fixed
- **修复负数 cvpx 处理** - 负数 cvpx 现在正确生成 clamp 函数
  - 负数值会自动调整 clamp 参数顺序，确保最小值小于最大值
  - 添加了负数值的完整测试覆盖
  - 更新文档说明负数值处理逻辑
- **智能负数语义处理** - maxvpx 和 minvpx 在负数时自动交换语义
  - 负数 maxvpx 自动转换为 min() 函数，保持最小边界语义
  - 负数 minvpx 自动转换为 max() 函数，保持最大边界语义
  - 避免用户在使用负数时需要手动调整单位类型的问题
  - 提升了负数值使用的直观性和一致性

### Changed
- **简化配置** - `clampMinRatio` 和 `clampMaxRatio` 现在默认使用 `minRatio` 和 `maxRatio` 的值
  - 减少配置复杂度，只需设置 `minRatio` 和 `maxRatio` 即可统一控制所有单位的比例
  - 仍然支持显式设置 `clampMinRatio` 和 `clampMaxRatio` 来独立控制 cvpx 的行为
- 更新了插件描述，包含 cvpx 功能说明
- 优化了正则表达式以支持 cvpx 单位匹配
- 扩展了类型定义，包含新增的配置选项

## [1.3.0] - 2025-07-17

### Added
- **转换日志功能** - 新增转换日志记录和输出功能
  - `logConversions`: 控制是否记录转换日志，默认 false
  - `logLevel`: 日志级别设置，支持 'silent', 'info', 'verbose'，默认 'info'
  - 在 `info` 级别显示按文件统计的转换数量
  - 在 `verbose` 级别显示每个转换的详细信息，包括文件位置、选择器和具体转换内容
  - 在 `silent` 级别完全静默，不输出任何日志
- 完整的日志功能测试用例覆盖
- 更新了 README 文档，包含日志功能的详细说明和示例

### Changed
- 更新了 JSDoc 注释，添加了日志相关参数的说明
- 增强了插件的调试和开发体验

## [1.2.0] - 2025-07-17

### Added
- `maxRatio` parameter to customize the pixel multiplier for `maxvpx` units
  - Default value: 1 (no change from original behavior)
  - Example: `maxRatio: 1.5` converts `20maxvpx` to `max(5.33vw, 30px)` instead of `max(5.33vw, 20px)`
- `minRatio` parameter to customize the pixel multiplier for `minvpx` units
  - Default value: 1 (no change from original behavior)
  - Example: `minRatio: 0.8` converts `20minvpx` to `min(5.33vw, 16px)` instead of `min(5.33vw, 20px)`
- Enhanced test coverage for maxRatio and minRatio functionality
- New demo examples showing combined usage of maxRatio and minRatio

### Changed
- Improved numerical precision handling to avoid floating-point errors
- Updated plugin documentation to include maxRatio and minRatio parameter descriptions

### Fixed
- Fixed floating-point precision issues in pixel value calculations
- Corrected display formatting in demo test output (newline character handling)

## [1.1.0] - 2025-07-15

### Added
- Support for `maxvpx` unit conversion to `max(vw, Npx)` CSS function
- Support for `minvpx` unit conversion to `min(vw, Npx)` CSS function
- New test cases for maxvpx and minvpx functionality
- Enhanced documentation with examples for new unit types

### Changed
- Updated plugin description to reflect new functionality
- Improved README with comprehensive examples for all unit types
- Clarified description of maxvpx and minvpx behavior (maxvpx sets minimum bounds, minvpx sets maximum bounds)
- Fixed misleading comments in demo files about maxvpx and minvpx usage

## [1.0.1] - 2025-07-15

### Added
- Initial release of vpx-to-viewport plugin
- Support for converting vpx units to vw units
- Configuration options for viewport width, precision, and blacklists
- Support for CSS variables blacklist
- TypeScript type definitions

### Changed
- Nothing yet

### Fixed
- Nothing yet

## [1.0.0] - 2025-07-15

### Added
- PostCSS plugin for converting vpx to vw units
- Support for selector and variable blacklists
- Configurable viewport width and precision
- Minimum pixel value threshold
