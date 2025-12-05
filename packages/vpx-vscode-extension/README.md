# VPX CSS Helper

VS Code extension that provides IntelliSense and syntax highlighting for the [`postcss-vpx-to-vw`](https://github.com/EquinoxHZ/vpx-to-viewport) plugin.

## Features

✨ **Smart Completions**
- Auto-completion for `vpx`, `maxvpx`, `minvpx`, `cvpx` units
- Intelligent number+letter parsing (type `100v` → suggests `vpx` → inserts `100vpx`)
- Snippet-style completion for `linear-vpx()` function (2-param and 4-param forms)

📖 **Hover Documentation**
- Detailed explanations for each custom unit
- Usage examples for `linear-vpx()` helper

🎨 **Syntax Highlighting**
- VPX units displayed in **purple** (#C586C0)
- `linear-vpx()` function displayed in **yellow** (#DCDCAA)
- Works in CSS, SCSS, LESS, Vue, JSX, and TSX files

## Installation

### From VS Code Marketplace
1. Open VS Code
2. Go to Extensions (Cmd+Shift+X)
3. Search for "VPX CSS Helper"
4. Click Install

### From VSIX File
```bash
code --install-extension vpx-css-helper-0.1.0.vsix
```

## Usage

Simply start typing VPX units in your CSS:

```css
.container {
  width: 100vpx;           /* Converts to vw */
  max-width: 1920maxvpx;   /* With max bound */
  min-width: 375minvpx;    /* With min bound */
  padding: 20cvpx;         /* Clamped value */
  
  /* Fluid typography with linear interpolation */
  font-size: linear-vpx(16, 24);
  margin: linear-vpx(10, 30, 375, 1920);
}
```

## Configuration

Settings can be toggled under `Preferences → Settings → Extensions → VPX CSS Helper`:

- `vpxCssHelper.enableCompletions` (default: `true`) — Enable/disable auto-completions
- `vpxCssHelper.enableHover` (default: `true`) — Enable/disable hover documentation

## Requirements

- VS Code 1.82.0 or higher
- Works with `postcss-vpx-to-vw` v1.6.0+

## Release Notes

### 0.1.0
- Initial release
- Smart completions with number parsing
- Hover documentation
- Syntax highlighting for 6 language types

## License

MIT © Felix Zhu
