# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
