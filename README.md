# PostCSS VPX to VW 插件

中文版 | [English](README.en.md) | [📊 在线演示](https://equinoxhz.github.io/vpx-to-viewport/)

这是一个自定义的 PostCSS 插件，用于将 `vpx`、`maxvpx`、`minvpx` 和 `cvpx` 单位自动转换为对应的 `vw` 单位和 CSS 函数。

> 💡 **想直观了解各个单位的效果差异？** 访问我们的[交互式演示页面](https://equinoxhz.github.io/vpx-to-viewport/)，实时调整参数查看效果！

## 功能特性

- 🔄 将 `vpx` 单位转换为 `vw` 单位
- 📏 将 `maxvpx` 单位转换为 `max(vw, Npx)` 函数（设置最小值边界）
- 📐 将 `minvpx` 单位转换为 `min(vw, Npx)` 函数（设置最大值边界）
- 🔒 将 `cvpx` 单位转换为 `clamp(minPx, vw, maxPx)` 函数（设置响应式范围边界）
- 📈 **新增**：将 `linear-vpx()` 函数转换为线性插值表达式（响应式线性缩放）
- 🎯 支持选择器和 CSS 变量黑名单
- ⚙️ 可配置的视口宽度和精度
- 🔧 支持最小转换值设置
- 📊 转换日志记录，支持多种级别（静默、信息、详细）
- 📱 支持媒体查询独立配置，实现多端适配

## 安装

```bash
npm install vpx-to-viewport --save-dev
```

或者使用 yarn:

```bash
yarn add vpx-to-viewport --dev
```

## 使用方法

### 在 PostCSS 配置中使用

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require("vpx-to-viewport")({
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

### 在 Vite 中使用（PostCSS 方式）

```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  css: {
    postcss: {
      plugins: [
        require('vpx-to-viewport')({
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

### 在 Vite 中使用（独立插件方式 ⚡ 推荐）

**性能提升 70%，无需 PostCSS 依赖！**

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import vitePluginVpx from 'vpx-to-viewport/vite-plugin-vpx';

export default defineConfig({
  plugins: [
    vitePluginVpx({
      viewportWidth: 375,
      unitPrecision: 5,
      minPixelValue: 1,
      selectorBlackList: ['.ignore'],
      variableBlackList: ['--ignore-var']
    })
  ]
});
```

> 📖 **详细文档**: 查看 [Vite Plugin 使用指南](VITE_PLUGIN_GUIDE.md) 了解独立插件的完整功能和配置。

## CSS 智能提示（VS Code 扩展）

仓库内提供了独立的 VS Code 扩展 **VPX CSS Helper**，用于为 `vpx` 系列单位和 `linear-vpx()` 函数补充智能提示与悬停文档。

### 安装步骤

1. 进入扩展目录并安装依赖：
   ```bash
   cd packages/vpx-vscode-extension && npm install
   ```
2. 在 VS Code 中按 `F5` 启动 Extension Development Host 即可验证效果。
3. 如需打包本地安装，执行 `npm run compile` 后使用 [`vsce`](https://code.visualstudio.com/api/working-with-extensions/publishing-extension) 生成 `.vsix`。

### 功能

- ✅ 在 CSS/SCSS/LESS 中输入 `vpx`、`maxvpx`、`minvpx`、`cvpx` 提供快速补全
- ✅ `linear-vpx()` 同时提供简写与完整参数模板
- ✅ 鼠标悬停可看到每个单位与函数的说明
- ✅ 可通过设置面板开启/关闭补全或悬停

详细指南见 [`CSS_INTELLISENSE.md`](CSS_INTELLISENSE.md)。

## 多端适配支持

插件提供了两种多端适配方案，您可以根据项目需求选择合适的方案：

### 方案一：多插件实例（适用于组件级适配）

通过注册多个插件实例，您可以同时支持不同设备的视口转换。这种方案适合需要为不同设备创建专用组件或样式的场景：

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    // 移动端插件 - 只转换 .m- 开头的选择器
    require("vpx-to-viewport")({
      viewportWidth: 375,
      unitPrecision: 5,
      minPixelValue: 1,
      selectorBlackList: [/^(?!.*\.m-)/], // 只转换包含.m-的选择器
      pluginId: "mobile",
    }),
    // 桌面端插件 - 只转换 .d- 开头的选择器
    require("vpx-to-viewport")({
      viewportWidth: 1920,
      unitPrecision: 5,
      minPixelValue: 1,
      selectorBlackList: [/^(?!.*\.d-)/], // 只转换包含.d-的选择器
      pluginId: "desktop",
    }),
    // 平板端插件 - 只转换 .t- 开头的选择器
    require("vpx-to-viewport")({
      viewportWidth: 768,
      unitPrecision: 5,
      minPixelValue: 1,
      selectorBlackList: [/^(?!.*\.t-)/], // 只转换包含.t-的选择器
      pluginId: "tablet",
    }),
  ],
};
```

**使用示例：**
```css
/* 为不同设备创建专用样式 */
.m-header {
  height: 120vpx; /* 移动端：32vw */
}

.t-header {
  height: 120vpx; /* 平板端：15.625vw */
}

.d-header {
  height: 120vpx; /* 桌面端：6.25vw */
}
```

### 方案二：媒体查询配置（适用于响应式设计）

通过为不同媒体查询配置不同的转换参数，让一套样式代码适配多种设备。这种方案更适合响应式设计：

```javascript
require('vpx-to-viewport')({
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

**使用示例：**
```css
/* 输入：一套代码适配多端 */
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

/* 输出：自动适配不同设备 */
.container {
  width: 80vw;                    /* 移动端：300/375*100 = 80vw */
  height: max(53.33333vw, 200px); /* 移动端默认配置 */
}

@media (min-width: 768px) {
  .container {
    width: 39.06vw;               /* 平板端：300/768*100 = 39.06vw */
    height: max(26.04vw, 300px);  /* 平板端：maxRatio=1.5 */
  }
}
```

#### 两种方案的对比

| 特性 | 多插件实例 | 媒体查询配置 |
|------|------------|--------------|
| **适用场景** | 组件级差异化设计 | 响应式统一设计 |
| **CSS结构** | 为不同设备写不同选择器 | 一套选择器配合媒体查询 |
| **维护成本** | 较高（需维护多套样式） | 较低（一套代码自动适配） |
| **灵活性** | 高（可完全自定义） | 中（基于媒体查询约束） |
| **包体积** | 较大 | 较小 |
| **推荐使用** | 移动端/桌面端差异很大的项目 | 主要做响应式适配的项目 |

#### 媒体查询配置特性

- **配置继承**: 媒体查询配置会继承默认配置，只需指定需要覆盖的选项
- **灵活匹配**: 支持精确匹配（如 `@media (min-width: 768px)`）和模糊匹配（如 `min-width: 768px`）
- **增强日志**: 日志会显示每个转换使用的媒体查询和视口宽度

### 在 CSS 中使用

在 CSS 中，您可以使用 `vpx`、`maxvpx`、 `minvpx` 和 `cvpx` 单位，构建系统会自动将其转换为相应的值。

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

#### 线性缩放 (linear-vpx) 🆕

`linear-vpx()` 函数用于实现属性值在指定视口宽度区间内的线性插值缩放，自动生成响应式的 `calc()` 表达式。

**语法：**
```css
/* 完整形式：指定所有参数 */
property: linear-vpx(最小值, 最大值, 最小视口宽度, 最大视口宽度);

/* 简化形式：使用配置中的默认视口范围 */
property: linear-vpx(最小值, 最大值);
```

**基础示例：**
```css
/* 输入 */
.hero {
  width: linear-vpx(840, 1000, 1200, 1920);
  font-size: linear-vpx(16, 24, 375, 1920);
}

/* 输出（autoClampLinear: true，默认）*/
.hero {
  width: clamp(840px, calc(840px + 160 * (100vw - 1200px) / 720), 1000px);
  font-size: clamp(16px, calc(16px + 8 * (100vw - 375px) / 1545), 24px);
}
```

**说明：**
- 当视口宽度为 1200px 时，width 为 840px
- 当视口宽度为 1920px 时，width 为 1000px
- 在 1200px 到 1920px 之间，width 随视口宽度线性变化
- 使用 `clamp()` 确保值不会超出设定范围

**配置选项：**
```javascript
require('vpx-to-viewport')({
  linearMinWidth: 1200,      // 默认最小视口宽度
  linearMaxWidth: 1920,      // 默认最大视口宽度
  autoClampLinear: true,     // 是否自动添加 clamp 包裹
})
```

**使用默认视口范围：**
```css
/* 输入 */
.text {
  font-size: linear-vpx(16, 24);
  padding: linear-vpx(20, 40);
}

/* 配置：linearMinWidth: 375, linearMaxWidth: 1920 */
/* 输出 */
.text {
  font-size: clamp(16px, calc(16px + 8 * (100vw - 375px) / 1545), 24px);
  padding: clamp(20px, calc(20px + 20 * (100vw - 375px) / 1545), 40px);
}
```

**禁用 clamp 包裹：**
```css
/* 配置：autoClampLinear: false */
/* 输入 */
.container {
  padding: linear-vpx(20, 40, 768, 1440);
}

/* 输出（允许在区间外继续线性外推）*/
.container {
  padding: calc(20px + 20 * (100vw - 768px) / 672);
}
```

**支持负数：**
```css
/* 输入 */
.element {
  margin-left: linear-vpx(-100, -50, 1200, 1920);
}

/* 输出 */
.element {
  margin-left: clamp(-100px, calc(-100px + 50 * (100vw - 1200px) / 720), -50px);
}
```

**媒体查询独立配置：**
```javascript
require('vpx-to-viewport')({
  linearMinWidth: 375,
  linearMaxWidth: 1920,
  mediaQueries: {
    '@media (min-width: 768px)': {
      linearMinWidth: 768,
      linearMaxWidth: 1440,
      autoClampLinear: false, // 可在特定媒体查询中禁用 clamp
    }
  }
})
```

```css
/* 输入 */
.responsive {
  width: linear-vpx(300, 400);
}

@media (min-width: 768px) {
  .responsive {
    width: linear-vpx(600, 900);
  }
}

/* 输出 */
.responsive {
  width: clamp(300px, calc(300px + 100 * (100vw - 375px) / 1545), 400px);
}

@media (min-width: 768px) {
  .responsive {
    width: calc(600px + 300 * (100vw - 768px) / 672); /* 无 clamp */
  }
}
```

**优势：**
- ✅ 无需媒体查询断点，属性值自动随视口平滑过渡
- ✅ 语法简洁，比手写 calc 表达式更清晰
- ✅ 精确控制数值范围和视口范围
- ✅ 支持与其他 vpx 单位混合使用
- ✅ 自动处理浮点数精度问题

**实际应用场景：**
```css
/* 响应式布局 */
.card-grid {
  gap: linear-vpx(16, 32, 375, 1920);           /* 网格间距 */
  padding: linear-vpx(20, 60, 375, 1920);       /* 内边距 */
}

.card {
  border-radius: linear-vpx(8, 16, 375, 1920);  /* 圆角 */
  font-size: linear-vpx(14, 18, 375, 1920);     /* 字体大小 */
}

/* 可与其他单位混合使用 */
.header {
  height: linear-vpx(60, 100, 375, 1920);       /* 线性缩放高度 */
  padding: 20vpx;                                /* 普通 vpx */
  margin: 10maxvpx;                              /* 带最小值限制 */
}
```

> 💡 **提示**：查看 `demo/linear-vpx-demo.js` 和 `demo/LINEAR_VPX_GUIDE.md` 了解更多示例和详细说明。

## 配置选项

插件支持以下配置选项：

- `viewportWidth`: 视口宽度，默认 375px
- `unitPrecision`: 小数精度，默认 5
- `minPixelValue`: 最小转换值，默认 1px，小于此值的 vpx 会转换为 px
- `maxRatio`: maxvpx 的像素值倍数，默认 1
- `minRatio`: minvpx 的像素值倍数，默认 1
- `clampMinRatio`: cvpx 的最小值倍数，默认使用 minRatio
- `clampMaxRatio`: cvpx 的最大值倍数，默认使用 maxRatio
- `linearMinWidth`: linear-vpx 的默认最小视口宽度，默认 1200
- `linearMaxWidth`: linear-vpx 的默认最大视口宽度，默认 1920
- `autoClampLinear`: 是否为 linear-vpx 自动添加 clamp 限制，默认 true
- `selectorBlackList`: 选择器黑名单，可以是字符串或正则表达式数组
- `variableBlackList`: CSS 变量黑名单，可以是字符串或正则表达式数组
- `pluginId`: 插件标识符，用于区分多个实例，默认 'default'
- `logConversions`: 是否记录转换日志，默认 false
- `logLevel`: 日志级别，可选 'silent', 'info', 'verbose'，默认 'info'
- `mediaQueries`: 媒体查询特定配置，为不同媒体查询设置不同的转换参数

**配置简化说明：** `clampMinRatio` 和 `clampMaxRatio` 如果不显式设置，会自动使用 `minRatio` 和 `maxRatio` 的值。这样您只需要配置 `minRatio` 和 `maxRatio`，就能让 `maxvpx`、`minvpx` 和 `cvpx` 保持一致的比例设置。

### 日志功能

插件提供了日志功能，帮助您了解转换过程和结果：

```javascript
require('vpx-to-viewport')({
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
[vpx-to-viewport] 转换了 15 个 vpx 单位:
  src/components/Header.vue: 5 个转换
  src/pages/Home.vue: 10 个转换
```

**verbose 级别**：
```
[vpx-to-viewport] 转换了 15 个 vpx 单位:
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
