# VS Code CSS IntelliSense 配置指南

本插件提供了 CSS 自定义数据文件和代码片段，可为 VS Code 等编辑器提供 `vpx`、`maxvpx`、`minvpx`、`cvpx` 和 `linear-vpx()` 的智能提示与快捷补全。

## 配置方法

### 方式一：项目级配置（推荐）

在项目根目录创建 `.vscode/settings.json` 文件：

```json
{
  "css.customData": [
    "./node_modules/postcss-vpx-to-vw/css-data.json"
  ]
}
```

### 方式二：用户全局配置

1. 打开 VS Code 设置（`Cmd/Ctrl + ,`）
2. 搜索 `css.customData`
3. 点击 "在 settings.json 中编辑"
4. 添加配置：

```json
{
  "css.customData": [
    "~/.vscode/extensions/postcss-vpx-to-vw/css-data.json"
  ]
}
```

或者在项目中使用相对路径：

```json
{
  "css.customData": [
    "./node_modules/postcss-vpx-to-vw/css-data.json"
  ]
}
```

### 方式三：在 package.json 中添加配置提示

在你的项目 `package.json` 中添加 `vscode` 字段：

```json
{
  "vscode": {
    "recommendations": {
      "css.customData": [
        "./node_modules/postcss-vpx-to-vw/css-data.json"
      ]
    }
  }
}
```

  ### 代码片段

  - 安装插件后会自动生成 `.vscode/css.code-snippets`
  - 输入 `vpx`、`maxvpx`、`minvpx`、`cvpx` 可快速插入单位示例
  - 输入 `linear-vpx` 或 `linear-vpx-full` 会自动补全函数模板
  - 若未自动生成，可手动复制 `node_modules/postcss-vpx-to-vw/css-snippets.json` 到 `.vscode/css.code-snippets`

## 支持的单位和函数

配置完成后，编辑器将为以下内容提供智能提示：

### 单位
- `vpx` - 基础视口单位，转换为 vw
- `maxvpx` - 带最小值限制，转换为 max(vw, Npx)
- `minvpx` - 带最大值限制，转换为 min(vw, Npx)
- `cvpx` - 带范围限制，转换为 clamp(minPx, vw, maxPx)

### 函数
- `linear-vpx()` - 线性插值函数，支持 2 参数和 4 参数形式

## 效果展示

配置后，在编写 CSS 时：

1. **输入单位时会有提示**
   ```css
   .element {
     width: 100v  /* 输入 v 会提示 vpx, maxvpx, minvpx, cvpx */
   }
   ```

2. **悬停显示说明**
   - 鼠标悬停在 `36vpx` 上会显示单位说明
   - 鼠标悬停在 `linear-vpx()` 上会显示函数用法

3. **函数参数提示**
   ```css
   .element {
     width: linear-vpx(  /* 会提示参数列表 */
   }
   ```

## 其他编辑器

### WebStorm / IntelliJ IDEA
1. Settings → Editor → Language Injections
2. 添加自定义语言注入规则

### Sublime Text
需要安装支持 CSS Custom Data 的插件

## 故障排除

### 智能提示不生效？

1. **重启编辑器**：修改配置后需要重启 VS Code
2. **检查路径**：确保 `css-data.json` 路径正确
3. **查看输出**：VS Code 输出面板（Output）→ 选择 "CSS Language Features"
4. **文件类型**：确保文件被识别为 CSS/SCSS/LESS

### 提示不完整？

确保 VS Code 版本 ≥ 1.56（支持 CSS Custom Data 1.1）

## 文档链接

- [CSS Custom Data 规范](https://github.com/microsoft/vscode-custom-data)
- [VS Code CSS 支持](https://code.visualstudio.com/docs/languages/css)
