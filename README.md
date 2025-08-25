# PostCSS VPX to VW 插件

中文版 | [English](README.en.md)

这是一个自定义的 PostCSS 插件，用于将 `vpx`、`maxvpx`、`minvpx` 和 `cvpx` 单位自动转换为对应的 `vw` 单位和 CSS 函数。

## 功能特性

- 🔄 将 `vpx` 单位转换为 `vw` 单位
- 📏 将 `maxvpx` 单位转换为 `max(vw, Npx)` 函数（设置最小值边界）
- 📐 将 `minvpx` 单位转换为 `min(vw, Npx)` 函数（设置最大值边界）
- 🔒 将 `cvpx` 单位转换为 `clamp(minPx, vw, maxPx)` 函数（设置响应式范围边界）
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
      // clampMinRatio 和 clampMaxRatio 会自动使用 minRatio 和 maxRatio 的值
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
          // clampMinRatio 和 clampMaxRatio 会自动使用 minRatio 和 maxRatio 的值
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

#### 响应式范围边界 (cvpx)

`cvpx` 单位会转换为 `clamp(minPx, vw, maxPx)` 函数，同时设置最小值和最大值边界，提供更好的响应式控制。可以通过 `clampMinRatio` 和 `clampMaxRatio` 参数调整像素值的倍数。

```css
/* 输入 */
.element {
  font-size: 36cvpx;
  padding: 20cvpx;
}

/* 输出（基于 375px 视口宽度，clampMinRatio: 0.5, clampMaxRatio: 2）*/
.element {
  font-size: clamp(18px, 9.6vw, 72px);
  padding: clamp(10px, 5.33333vw, 40px);
}

/* 输出（基于 375px 视口宽度，clampMinRatio: 0.3, clampMaxRatio: 3）*/
.element {
  font-size: clamp(10.8px, 9.6vw, 108px);
  padding: clamp(6px, 5.33333vw, 60px);
}
```

#### 混合使用

```css
/* 输入 */
.element {
  margin: 10vpx 20maxvpx 15minvpx 25cvpx;
}

/* 输出（基于 375px 视口宽度）*/
.element {
  margin: 2.66667vw max(5.33333vw, 20px) min(4vw, 15px) clamp(25px, 6.66667vw, 25px);
}
```

#### 负数值处理

插件智能处理负数值，确保语义的一致性：

**cvpx 负数处理：**
```css
/* 输入 */
.element {
  margin-left: -20cvpx;
  text-indent: -15cvpx;
}

/* 输出（基于 375px 视口宽度）*/
.element {
  margin-left: clamp(-20px, -5.33333vw, -20px);
  text-indent: clamp(-15px, -4vw, -15px);
}
```

**maxvpx/minvpx 负数语义自动交换：**
```css
/* 输入 */
.element {
  margin-left: -20maxvpx;  /* 用户期望：设置负值的最小边界 */
  margin-right: -15minvpx; /* 用户期望：设置负值的最大边界 */
}

/* 输出（智能语义交换）*/
.element {
  margin-left: min(-5.33333vw, -20px);  /* 自动转为 min，保持最小边界语义 */
  margin-right: max(-4vw, -15px);       /* 自动转为 max，保持最大边界语义 */
}
```

这种智能处理避免了用户在使用负数时需要手动调整 `maxvpx` 和 `minvpx` 的问题。

## 配置选项

插件支持以下配置选项：

- `viewportWidth`: 视口宽度，默认 375px
- `unitPrecision`: 小数精度，默认 5
- `minPixelValue`: 最小转换值，默认 1px，小于此值的 vpx 会转换为 px
- `maxRatio`: maxvpx 的像素值倍数，默认 1
- `minRatio`: minvpx 的像素值倍数，默认 1
- `clampMinRatio`: cvpx 的最小值倍数，默认使用 minRatio
- `clampMaxRatio`: cvpx 的最大值倍数，默认使用 maxRatio
- `selectorBlackList`: 选择器黑名单，可以是字符串或正则表达式数组
- `variableBlackList`: CSS 变量黑名单，可以是字符串或正则表达式数组
- `pluginId`: 插件标识符，用于区分多个实例，默认 'default'
- `logConversions`: 是否记录转换日志，默认 false
- `logLevel`: 日志级别，可选 'silent', 'info', 'verbose'，默认 'info'
- `mediaQueries`: 媒体查询特定配置，为不同媒体查询设置不同的转换参数

**配置简化说明：** `clampMinRatio` 和 `clampMaxRatio` 如果不显式设置，会自动使用 `minRatio` 和 `maxRatio` 的值。这样您只需要配置 `minRatio` 和 `maxRatio`，就能让 `maxvpx`、`minvpx` 和 `cvpx` 保持一致的比例设置。

### 媒体查询支持（新功能 🆕）

插件现在支持为不同的媒体查询配置不同的转换参数，让响应式设计更加灵活：

```javascript
require('postcss-vpx-to-vw')({
  // 默认配置（移动端）
  viewportWidth: 375,
  unitPrecision: 5,
  maxRatio: 1,
  minRatio: 1,
  
  // 媒体查询特定配置
  mediaQueries: {
    // 平板配置
    '@media (min-width: 768px)': {
      viewportWidth: 768,
      unitPrecision: 2,
      maxRatio: 1.5,
      minRatio: 0.9
    },
    
    // 桌面配置
    '@media (min-width: 1024px)': {
      viewportWidth: 1024,
      maxRatio: 2.0,
      minRatio: 1.0
    },
    
    // 小屏配置
    '@media (max-width: 480px)': {
      viewportWidth: 320,
      unitPrecision: 4,
      minPixelValue: 0.5
    }
  }
})
```

#### 媒体查询配置特性

- **配置继承**: 媒体查询配置会继承默认配置，只需指定需要覆盖的选项
- **灵活匹配**: 支持精确匹配（如 `@media (min-width: 768px)`）和模糊匹配（如 `min-width: 768px`）
- **增强日志**: 日志会显示每个转换使用的媒体查询和视口宽度

#### 媒体查询转换示例

```css
/* 输入 CSS */
.container {
  width: 300vpx;
  height: 200maxvpx;
}

@media (min-width: 768px) {
  .container {
    width: 300vpx;
    height: 200maxvpx;
  }
}

/* 输出 CSS */
.container {
  width: 80vw;                    /* 300/375*100 = 80vw */
  height: max(53.33333vw, 200px); /* 默认配置 */
}

@media (min-width: 768px) {
  .container {
    width: 39.06vw;               /* 300/768*100 = 39.06vw */
    height: max(26.04vw, 300px);  /* 平板配置: maxRatio=1.5 */
  }
}
```

#### 使用场景

- **多设备适配**: 为手机、平板、桌面设备设置不同的转换基准
- **精度优化**: 不同屏幕尺寸使用不同的精度要求
- **边界值调整**: 根据设备特性调整 maxvpx/minvpx 的边界倍数

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
