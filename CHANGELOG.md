# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
