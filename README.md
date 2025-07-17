# PostCSS VPX to VW 插件

这是一个自定义的 PostCSS 插件，用于将 `vpx`、`maxvpx` 和 `minvpx` 单位自动转换为对应的 `vw` 单位和 CSS 函数。

## 功能特性

- 🔄 将 `vpx` 单位转换为 `vw` 单位
- 📏 将 `maxvpx` 单位转换为 `max(vw, Npx)` 函数（设置最小值边界）
- 📐 将 `minvpx` 单位转换为 `min(vw, Npx)` 函数（设置最大值边界）
- 🎯 支持选择器和 CSS 变量黑名单
- ⚙️ 可配置的视口宽度和精度
- 🔧 支持最小转换值设置

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
      maxRatio: 1,
      minRatio: 1,
      selectorBlackList: ['.ignore'],
      variableBlackList: ['--ignore-var']
    })
  ]
};
```

### 在 CSS 中使用

在 CSS 中，您可以使用 `vpx`、`maxvpx` 和 `minvpx` 单位，构建系统会自动将其转换为相应的值。

### 示例

#### 基本转换

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

#### 最小值边界 (maxvpx)

`maxvpx` 单位会转换为 `max(vw, Npx)` 函数，确保在小屏幕上不会小于指定的像素值。可以通过 `maxRatio` 参数调整像素值的倍数。

```css
/* 输入 */
.element {
  font-size: 36maxvpx;
  padding: 20maxvpx;
}

/* 输出（基于 375px 视口宽度，maxRatio: 1）*/
.element {
  font-size: max(9.6vw, 36px);
  padding: max(5.33333vw, 20px);
}

/* 输出（基于 375px 视口宽度，maxRatio: 1.5）*/
.element {
  font-size: max(9.6vw, 54px);
  padding: max(5.33333vw, 30px);
}
```

#### 最大值边界 (minvpx)

`minvpx` 单位会转换为 `min(vw, Npx)` 函数，确保在大屏幕上不会大于指定的像素值。可以通过 `minRatio` 参数调整像素值的倍数。

```css
/* 输入 */
.element {
  font-size: 36minvpx;
  padding: 20minvpx;
}

/* 输出（基于 375px 视口宽度，minRatio: 1）*/
.element {
  font-size: min(9.6vw, 36px);
  padding: min(5.33333vw, 20px);
}

/* 输出（基于 375px 视口宽度，minRatio: 0.8）*/
.element {
  font-size: min(9.6vw, 28.8px);
  padding: min(5.33333vw, 16px);
}
```

#### 混合使用

```css
/* 输入 */
.element {
  margin: 10vpx 20maxvpx 15minvpx 25vpx;
}

/* 输出（基于 375px 视口宽度）*/
.element {
  margin: 2.66667vw max(5.33333vw, 20px) min(4vw, 15px) 6.66667vw;
}
```

## 配置选项

插件支持以下配置选项：

- `viewportWidth`: 视口宽度，默认 375px
- `unitPrecision`: 小数精度，默认 5
- `minPixelValue`: 最小转换值，默认 1px，小于此值的 vpx 会转换为 px
- `maxRatio`: maxvpx 的像素值倍数，默认 1
- `minRatio`: minvpx 的像素值倍数，默认 1
- `selectorBlackList`: 选择器黑名单，可以是字符串或正则表达式数组
- `variableBlackList`: CSS变量黑名单，可以是字符串或正则表达式数组  
- `pluginId`: 插件标识符，用于区分多个实例，默认 'default'

### 比例参数说明

- `maxRatio`: 控制 `maxvpx` 转换后 `max()` 函数中像素值的倍数
  - 例如：`maxRatio: 1.5` 会让 `20maxvpx` 转换为 `max(5.33vw, 30px)`
  - 适用场景：在大屏幕上需要更大的最小值时使用
  - 推荐 1 - 1.5 (适度增加最小值)

- `minRatio`: 控制 `minvpx` 转换后 `min()` 函数中像素值的倍数
  - 例如：`minRatio: 0.8` 会让 `20minvpx` 转换为 `min(5.33vw, 16px)`
  - 适用场景：在小屏幕上需要更紧凑的最大值时使用
  - 推荐 0.8 - 1 (适度减少最大值)

## 优势

1. **语义清晰**: `vpx` 明确表示这个值会被转换为视口单位
2. **灵活配置**: 可以针对不同项目设置不同的视口宽度
3. **选择器控制**: 支持黑名单机制，某些选择器可以不进行转换
4. **CSS变量支持**: 支持对CSS变量进行独立的黑名单控制

## 注意事项

1. 插件会在 PostCSS 处理过程中自动转换，无需手动操作
2. 转换后的值会保留指定的小数精度
3. 小于 `minPixelValue` 的值会转换为 `px` 单位
4. 支持在一个声明中混合使用 `vpx` 和其他单位

## 许可证

MIT

## 贡献

欢迎提交 issue 和 pull request。
