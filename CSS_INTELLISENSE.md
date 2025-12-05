# VS Code IntelliSense 指南

若要在 VS Code 中获得 `postcss-vpx-to-vw` 自定义单位与 `linear-vpx()` 的补全与悬停文档，请安装仓库内提供的 **VPX CSS Helper** 扩展。

## 安装扩展

1. 进入扩展项目目录并安装依赖：
   ```bash
   cd packages/vpx-vscode-extension
   npm install
   ```
2. 在 VS Code 中按 `F5` 运行 Extension Development Host 进行调试。
3. 若需分发给团队，可执行：
   ```bash
   npm run compile
   npx vsce package
   ```
   生成的 `.vsix` 文件可通过「扩展 → … → 从 VSIX 安装」导入。

## 扩展功能

- **补全提示**：在 CSS/SCSS/LESS 文件中输入 `vpx`、`maxvpx`、`minvpx`、`cvpx` 时自动提示。
- **函数片段**：键入 `linear-vpx` 可获得带参数占位符的完整模板。
- **悬停文档**：鼠标移动至任意 VPX 单位或 `linear-vpx()` 可查看用法说明。
- **设置开关**：`vpxCssHelper.enableCompletions` / `vpxCssHelper.enableHover` 可分别启用或关闭对应能力。

## 常见问题

### 无法触发补全？
- 确认文件语言模式为 CSS/SCSS/LESS。
- 在编辑器中按 `Ctrl/Cmd + Space` 强制触发补全。
- 检查设置中 `vpxCssHelper.enableCompletions` 是否开启。

### 悬停没有说明？
- 确认 `vpxCssHelper.enableHover` 为开启状态。
- 重启 Extension Development Host，或重新以 `.vsix` 安装后再试。

### 仍需使用 CSS Custom Data？
VS Code 目前不支持为自定义单位提供原生 Custom Data。若必须为其他编辑器提供提示，可参考旧版本的 `css-data.json` 手动维护；该文件已从包体移除，后续建议以扩展方式维护最新语义。

## 更多资料

- [VS Code 扩展开发文档](https://code.visualstudio.com/api)
- [postcss-vpx-to-vw 仓库](https://github.com/EquinoxHZ/vpx-to-viewport)
