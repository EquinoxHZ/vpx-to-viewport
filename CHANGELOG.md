# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
