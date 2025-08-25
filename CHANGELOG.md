# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
require('postcss-vpx-to-vw')({
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
- Initial release of postcss-vpx-to-vw plugin
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
