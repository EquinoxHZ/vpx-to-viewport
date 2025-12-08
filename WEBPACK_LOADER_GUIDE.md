# Webpack Loader VPX 使用指南

`webpack-loader-vpx` 是一个独立的 Webpack loader，可以将 `vpx` 单位转换为 `vw`，支持 `maxvpx`、`minvpx`、`cvpx` 和 `linear-vpx` 等高级功能。

## ✨ 特性

- 🚀 **独立运行** - 不依赖 PostCSS，直接处理 CSS 字符串
- ⚡ **高性能** - 比 PostCSS 插件更快的转换速度
- 🎯 **零配置** - 开箱即用，支持合理的默认值
- 📱 **移动优先** - 专为移动端响应式设计优化
- 🔧 **高度可配置** - 支持黑名单、媒体查询特定配置等
- 💪 **TypeScript 支持** - 完整的类型定义

## 📦 安装

```bash
npm install postcss-vpx-to-vw --save-dev
# 或
yarn add postcss-vpx-to-vw -D
# 或
pnpm add postcss-vpx-to-vw -D
```

同时需要安装 Webpack 相关依赖：

```bash
npm install webpack webpack-cli css-loader style-loader loader-utils schema-utils --save-dev
```

## 🚀 快速开始

### 基本配置

在 `webpack.config.js` 中配置：

```javascript
const path = require('path');

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-vpx-to-vw/webpack-loader-vpx.js',
            options: {
              viewportWidth: 375,
              unitPrecision: 5,
              minPixelValue: 1,
            },
          },
        ],
      },
    ],
  },
};
```

### 在 CSS 中使用

```css
.box {
  width: 300vpx;           /* → 80vw */
  padding: 20vpx;          /* → 5.33333vw */
  margin: 10maxvpx;        /* → max(2.66667vw, 10px) */
  font-size: 16minvpx;     /* → min(4.26667vw, 16px) */
  border-radius: 8cvpx;    /* → clamp(4px, 2.13333vw, 16px) */
}

.title {
  font-size: linear-vpx(24, 48, 768, 1920);
  /* → clamp(24px, calc(...), 48px) */
}
```

## ⚙️ 配置选项

### 完整配置示例

```javascript
{
  loader: 'postcss-vpx-to-vw/webpack-loader-vpx.js',
  options: {
    // 视口宽度（设计稿宽度）
    viewportWidth: 375,
    
    // 转换精度（小数点后位数）
    unitPrecision: 5,
    
    // 最小转换值（小于此值转为 px）
    minPixelValue: 1,
    
    // maxvpx 的倍数
    maxRatio: 1,
    
    // minvpx 的倍数
    minRatio: 1,
    
    // cvpx 的最小值倍数
    clampMinRatio: 0.5,
    
    // cvpx 的最大值倍数
    clampMaxRatio: 2,
    
    // linear-vpx 的默认最小视口宽度
    linearMinWidth: 1200,
    
    // linear-vpx 的默认最大视口宽度
    linearMaxWidth: 1920,
    
    // 是否自动为 linear-vpx 添加 clamp
    autoClampLinear: true,
    
    // 选择器黑名单
    selectorBlackList: ['.ignore-vpx', /^\.no-convert/],
    
    // CSS 变量黑名单
    variableBlackList: ['--keep-vpx', /^--raw-/],
    
    // 是否记录转换日志
    logConversions: true,
    
    // 日志级别：'silent' | 'info' | 'verbose'
    logLevel: 'info',
    
    // 媒体查询特定配置
    mediaQueries: {
      '@media (min-width: 768px)': {
        viewportWidth: 768,
        maxRatio: 1.5,
      },
      '@media (min-width: 1200px)': {
        viewportWidth: 1200,
      },
    },
  },
}
```

### 配置项说明

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `viewportWidth` | `number` | `375` | 视口宽度（设计稿宽度） |
| `unitPrecision` | `number` | `5` | 转换精度（小数点后位数） |
| `minPixelValue` | `number` | `1` | 最小转换值，小于此值转为 px |
| `maxRatio` | `number` | `1` | maxvpx 的像素值倍数 |
| `minRatio` | `number` | `1` | minvpx 的像素值倍数 |
| `clampMinRatio` | `number\|null` | `null` | cvpx 的最小值倍数（null 时使用 minRatio） |
| `clampMaxRatio` | `number\|null` | `null` | cvpx 的最大值倍数（null 时使用 maxRatio） |
| `linearMinWidth` | `number` | `1200` | linear-vpx 的默认最小视口宽度 |
| `linearMaxWidth` | `number` | `1920` | linear-vpx 的默认最大视口宽度 |
| `autoClampLinear` | `boolean` | `true` | 是否自动为 linear-vpx 添加 clamp |
| `selectorBlackList` | `Array<string\|RegExp>` | `[]` | 选择器黑名单 |
| `variableBlackList` | `Array<string\|RegExp>` | `[]` | CSS 变量黑名单 |
| `logConversions` | `boolean` | `false` | 是否记录转换日志 |
| `logLevel` | `string` | `'info'` | 日志级别 |
| `mediaQueries` | `object` | `{}` | 媒体查询特定配置 |

## 📖 单位说明

### 1. vpx - 基础响应式单位

最基本的 vpx 单位，直接转换为 vw：

```css
.box {
  width: 300vpx;
  /* 转换为: width: 80vw; (300 / 375 * 100) */
}
```

### 2. maxvpx - 最小不低于某值

表示"最小不低于某个像素值"：

```css
.box {
  width: 200maxvpx;
  /* 转换为: width: max(53.33333vw, 200px); */
  /* 视口缩小时不会小于 200px */
}
```

配置 `maxRatio`:

```javascript
{
  maxRatio: 1.2,  // 最小值为 200 * 1.2 = 240px
}
```

```css
.box {
  width: 200maxvpx;
  /* 转换为: width: max(53.33333vw, 240px); */
}
```

### 3. minvpx - 最大不超过某值

表示"最大不超过某个像素值"：

```css
.box {
  width: 250minvpx;
  /* 转换为: width: min(66.66667vw, 250px); */
  /* 视口放大时不会大于 250px */
}
```

配置 `minRatio`:

```javascript
{
  minRatio: 0.8,  // 最大值为 250 * 0.8 = 200px
}
```

```css
.box {
  width: 250minvpx;
  /* 转换为: width: min(66.66667vw, 200px); */
}
```

### 4. cvpx - 响应式范围限制

表示"在某个范围内响应式缩放"：

```css
.box {
  width: 200cvpx;
  /* 默认配置 (clampMinRatio=0.5, clampMaxRatio=2):
     转换为: width: clamp(100px, 53.33333vw, 400px); */
}
```

自定义范围：

```javascript
{
  clampMinRatio: 0.8,  // 最小值为 200 * 0.8 = 160px
  clampMaxRatio: 1.5,  // 最大值为 200 * 1.5 = 300px
}
```

```css
.box {
  width: 200cvpx;
  /* 转换为: width: clamp(160px, 53.33333vw, 300px); */
}
```

### 5. linear-vpx - 线性插值

用于在指定视口范围内线性缩放：

```css
.title {
  font-size: linear-vpx(24, 48);
  /* 使用默认范围 (1200px - 1920px):
     转换为: clamp(24px, calc(24px + 24 * (100vw - 1200px) / 720), 48px); */
}
```

指定自定义范围：

```css
.title {
  font-size: linear-vpx(20, 40, 768, 1440);
  /* 在 768px 到 1440px 之间从 20px 线性增长到 40px */
}
```

## 🎯 使用场景

### 1. 移动端适配

```css
/* 基于 375px 设计稿 */
.mobile-header {
  height: 88vpx;           /* → 23.46667vw */
  padding: 20vpx 30vpx;    /* → 5.33333vw 8vw */
  font-size: 28vpx;        /* → 7.46667vw */
}
```

### 2. 多设备响应式

```css
.container {
  width: 600vpx;  /* 移动端 */
}

@media (min-width: 768px) {
  .container {
    width: 700vpx;  /* 平板 */
    padding: 40maxvpx;  /* 最小 40px */
  }
}

@media (min-width: 1200px) {
  .container {
    max-width: 1200minvpx;  /* 最大 1200px */
  }
}
```

### 3. 流体排版

```css
.heading {
  font-size: linear-vpx(24, 48, 768, 1920);
  /* 在 768px 到 1920px 之间平滑缩放 */
}

.body-text {
  font-size: 16cvpx;
  /* 在范围内响应，不会过大或过小 */
}
```

### 4. 黑名单功能

```css
/* 配置选择器黑名单 */
/* selectorBlackList: ['.no-vpx', /^\.keep-/] */

.no-vpx {
  width: 100vpx;  /* 不会转换 */
}

.keep-original {
  height: 50vpx;  /* 不会转换 */
}
```

```css
/* 配置变量黑名单 */
/* variableBlackList: ['--raw-size'] */

:root {
  --raw-size: 100vpx;     /* 不会转换 */
  --normal-size: 100vpx;  /* 会转换 */
}
```

## 🔧 与其他 Loader 集成

### 与 SASS/SCSS 配合使用

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.scss$/i,
        use: [
          'style-loader',
          'css-loader',
          'postcss-vpx-to-vw/webpack-loader-vpx.js',
          'sass-loader',
        ],
      },
    ],
  },
};
```

### 与 Less 配合使用

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.less$/i,
        use: [
          'style-loader',
          'css-loader',
          'postcss-vpx-to-vw/webpack-loader-vpx.js',
          'less-loader',
        ],
      },
    ],
  },
};
```

### 与 PostCSS 配合使用

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          'css-loader',
          'postcss-vpx-to-vw/webpack-loader-vpx.js',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  'autoprefixer',
                  // 其他 PostCSS 插件
                ],
              },
            },
          },
        ],
      },
    ],
  },
};
```

## 📊 性能对比

| 方案 | 性能 | 依赖 | 灵活性 |
|------|------|------|--------|
| webpack-loader-vpx (独立) | ⚡⚡⚡⚡⚡ | 无 PostCSS | ⭐⭐⭐⭐⭐ |
| postcss-vpx-to-vw + postcss-loader | ⚡⚡⚡ | 需要 PostCSS | ⭐⭐⭐⭐⭐ |

## 🆚 对比其他方案

### vs PostCSS 插件

| 特性 | webpack-loader-vpx | postcss-vpx-to-vw |
|------|-------------------|-------------------|
| 依赖 PostCSS | ❌ 不需要 | ✅ 需要 |
| 性能 | ⚡ 更快 | ⚡ 快 |
| 配置复杂度 | 🟢 简单 | 🟡 中等 |
| 功能完整性 | ✅ 完整 | ✅ 完整 |
| TypeScript 支持 | ✅ 完整 | ✅ 完整 |

### 选择建议

- ✅ **使用 webpack-loader-vpx** 如果：
  - 你不需要其他 PostCSS 插件
  - 追求最佳性能
  - 希望配置更简单

- ✅ **使用 postcss-vpx-to-vw** 如果：
  - 你已经在使用 PostCSS
  - 需要与其他 PostCSS 插件配合
  - 希望在多个构建工具中使用统一的转换逻辑

## 🐛 常见问题

### 1. loader 未生效？

确保 loader 顺序正确，vpx loader 应该在 css-loader 之后：

```javascript
use: [
  'style-loader',
  'css-loader',          // 先
  'webpack-loader-vpx',  // 后
]
```

### 2. 某些 vpx 没有转换？

检查是否在黑名单中：

```javascript
{
  selectorBlackList: ['.ignore'],
  variableBlackList: ['--keep'],
}
```

### 3. 转换精度不够？

调整 `unitPrecision`：

```javascript
{
  unitPrecision: 8,  // 增加精度
}
```

### 4. 如何调试转换结果？

开启日志：

```javascript
{
  logConversions: true,
  logLevel: 'verbose',  // 详细日志
}
```

## 📝 示例项目

查看完整示例：

```bash
cd examples/webpack-loader-example
npm install
npm start
```

## 📄 许可证

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📚 相关文档

- [PostCSS 插件文档](./README.md)
- [Vite 插件文档](./VITE_PLUGIN_GUIDE.md)
- [CSS 智能提示文档](./CSS_INTELLISENSE.md)
