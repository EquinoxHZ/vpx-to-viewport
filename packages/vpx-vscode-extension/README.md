# VPX CSS Helper

VS Code extension that provides IntelliSense for the [`postcss-vpx-to-vw`](../../README.md) plugin.

## Features

- Completion items for `vpx`/`maxvpx`/`minvpx`/`cvpx` units
- Snippet-style completion for `linear-vpx()` (short and full forms)
- Hover documentation that explains each custom unit and the `linear-vpx()` helper

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Press `F5` in VS Code to launch an Extension Development Host and verify the completions.
3. Optional: build the extension artifact
   ```bash
   npm run compile
   ```
   To publish or install manually, use [`vsce`](https://code.visualstudio.com/api/working-with-extensions/publishing-extension) to package the extension.

## Configuration

The following settings can be toggled under `Preferences → Settings → Extensions → VPX CSS Helper`:

- `vpxCssHelper.enableCompletions` (default: `true`)
- `vpxCssHelper.enableHover` (default: `true`)

## License

MIT © Felix Zhu
