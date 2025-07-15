# PostCSS VPX to VW 插件

这是一个自定义的 PostCSS 插件，用于将 `vpx` 单位自动转换为 `vw` 单位。

## 安装

```bash
npm install postcss-vpx-to-vw --save-dev
```

或者使用 yarn:

```bash
yarn add postcss-vpx-to-vw --dev
```

## 使用方法

### 在 PostCSS 配置中使用

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require('postcss-vpx-to-vw')({
      viewportWidth: 375,
      unitPrecision: 5,
      minPixelValue: 1,
      selectorBlackList: ['.ignore'],
      variableBlackList: ['--ignore-var']
    })
  ]
};
```

### 在 CSS 中使用

在 CSS 中，您可以使用 `vpx` 单位来代替 `px`，构建系统会自动将其转换为相应的 `vw` 值。

### 示例

```css
/* 输入 */
.element {
  font-size: 36vpx;
  width: 200vpx;
  margin: 20vpx;
}

/* 输出（基于 375px 视口宽度）*/
.element {
  font-size: 9.6vw;
  width: 53.33333vw;
  margin: 5.33333vw;
}
```

## 配置选项

插件支持以下配置选项：

- `viewportWidth`: 视口宽度，默认 375px
- `unitPrecision`: 小数精度，默认 5
- `minPixelValue`: 最小转换值，默认 1px
- `selectorBlackList`: 选择器黑名单，可以是字符串或正则表达式数组
- `variableBlackList`: CSS变量黑名单，可以是字符串或正则表达式数组  
- `pluginId`: 插件标识符，用于区分多个实例，默认 'default'

## 优势

1. **避免 Prettier 格式化问题**: 使用 `vpx` 而不是 `PX`，避免被 Prettier 转换为小写
2. **语义清晰**: `vpx` 明确表示这个值会被转换为视口单位
3. **灵活配置**: 可以针对不同项目设置不同的视口宽度
4. **选择器控制**: 支持黑名单机制，某些选择器可以不进行转换
5. **CSS变量支持**: 支持对CSS变量进行独立的黑名单控制

## 注意事项

1. 插件会在 PostCSS 处理过程中自动转换，无需手动操作
2. 转换后的值会保留指定的小数精度
3. 小于 `minPixelValue` 的值不会被转换
4. 支持在一个声明中混合使用 `vpx` 和其他单位

## 许可证

MIT

## 贡献

欢迎提交 issue 和 pull request。

插件文件位于项目根目录：`postcss-vpx-to-vw.js`

配置在 `nuxt.config.ts` 中的 PostCSS 插件列表中。
