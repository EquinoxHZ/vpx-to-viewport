# PostCSS VPX to VW 插件

中文版 | [English](README.en.md)

这是一个自定义的 PostCSS 插件，用于将 `vpx`、`maxvpx` 和 `minvpx` 单位自动转换为对应的 `vw` 单位和 CSS 函数。

## 功能特性

- 🔄 将 `vpx` 单位转换为 `vw` 单位
- 📏 将 `maxvpx` 单位转换为 `max(vw, Npx)` 函数（设置最小值边界）
- 📐 将 `minvpx` 单位转换为 `min(vw, Npx)` 函数（设置最大值边界）
- 🎯 支持选择器和 CSS 变量黑名单
- ⚙️ 可配置的视口宽度和精度
- 🔧 支持最小转换值设置
- 📊 转换日志记录，支持多种级别（静默、信息、详细）

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
    require("postcss-vpx-to-vw")({
      viewportWidth: 375,
      unitPrecision: 5,
      minPixelValue: 1,
      maxRatio: 1,
      minRatio: 1,
      selectorBlackList: [".ignore"],
      variableBlackList: ["--ignore-var"],
    }),
  ],
};
```

### 在 Vite 中使用

```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  css: {
    postcss: {
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
    }
  }
});
```

### 多视口支持

通过注册多个插件实例，您可以同时支持不同设备的视口转换。这对于需要同时适配移动端和桌面端的项目特别有用：

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    // 移动端插件 - 只转换 .m- 开头的选择器
    require("postcss-vpx-to-vw")({
      viewportWidth: 375,
      unitPrecision: 5,
      minPixelValue: 1,
      selectorBlackList: [/^(?!.*\.m-)/], // 只转换包含.m-的选择器
      pluginId: "mobile",
    }),
    // 桌面端插件 - 只转换 .d- 开头的选择器
    require("postcss-vpx-to-vw")({
      viewportWidth: 1920,
      unitPrecision: 5,
      minPixelValue: 1,
      selectorBlackList: [/^(?!.*\.d-)/], // 只转换包含.d-的选择器
      pluginId: "desktop",
    }),
    // 平板端插件 - 只转换 .t- 开头的选择器
    require("postcss-vpx-to-vw")({
      viewportWidth: 768,
      unitPrecision: 5,
      minPixelValue: 1,
      selectorBlackList: [/^(?!.*\.t-)/], // 只转换包含.t-的选择器
      pluginId: "tablet",
    }),
  ],
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
- `variableBlackList`: CSS 变量黑名单，可以是字符串或正则表达式数组
- `pluginId`: 插件标识符，用于区分多个实例，默认 'default'
- `logConversions`: 是否记录转换日志，默认 false
- `logLevel`: 日志级别，可选 'silent', 'info', 'verbose'，默认 'info'

### 日志功能

插件提供了日志功能，帮助您了解转换过程和结果：

```javascript
require('postcss-vpx-to-vw')({
  logConversions: true,
  logLevel: 'verbose'  // 'silent', 'info', 'verbose'
})
```

#### 日志级别说明

- `silent`: 不输出任何日志
- `info`: 输出基本统计信息，按文件显示转换数量
- `verbose`: 输出详细的转换信息，包括每个转换的具体位置和内容

#### 示例输出

**info 级别**：
```
[postcss-vpx-to-vw] 转换了 15 个 vpx 单位:
  src/components/Header.vue: 5 个转换
  src/pages/Home.vue: 10 个转换
```

**verbose 级别**：
```
[postcss-vpx-to-vw] 转换了 15 个 vpx 单位:
  src/components/Header.vue:25:10 .header { width: 100vpx -> 26.66667vw }
  src/components/Header.vue:26:12 .header { height: 50vpx -> 13.33333vw }
  src/pages/Home.vue:15:8 .container { margin: 20vpx -> 5.33333vw }
  ...
```

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
4. **CSS 变量支持**: 支持对 CSS 变量进行独立的黑名单控制

## 注意事项

1. 插件会在 PostCSS 处理过程中自动转换，无需手动操作
2. 转换后的值会保留指定的小数精度
3. 小于 `minPixelValue` 的值会转换为 `px` 单位
4. 支持在一个声明中混合使用 `vpx` 和其他单位

## 许可证

MIT

## 贡献

欢迎提交 issue 和 pull request。
