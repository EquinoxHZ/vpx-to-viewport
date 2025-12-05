# linear-vpx 功能说明

## 概述

`linear-vpx()` 是一个新增的函数，用于实现 CSS 属性值在指定视口宽度区间内的线性插值缩放。它可以自动生成响应式的 `calc()` 表达式，并可选地包裹在 `clamp()` 中以限制边界。

## 语法

### 完整形式（4 参数）
```css
property: linear-vpx(最小值, 最大值, 最小视口宽度, 最大视口宽度);
```

### 简化形式（2 参数）
```css
property: linear-vpx(最小值, 最大值);
/* 使用配置中的 linearMinWidth 和 linearMaxWidth */
```

## 配置选项

### 全局配置
```javascript
{
  linearMinWidth: 1200,      // 默认最小视口宽度
  linearMaxWidth: 1920,      // 默认最大视口宽度
  autoClampLinear: true,     // 是否自动添加 clamp 包裹
}
```

### 媒体查询配置
```javascript
{
  linearMinWidth: 375,
  linearMaxWidth: 1920,
  mediaQueries: {
    '@media (min-width: 768px)': {
      linearMinWidth: 768,
      linearMaxWidth: 1440,
      autoClampLinear: false,  // 可在特定媒体查询中覆盖
    }
  }
}
```

## 转换示例

### 基础转换（启用 clamp）
```css
/* 输入 */
.element {
  width: linear-vpx(840, 1000, 1200, 1920);
}

/* 输出 */
.element {
  width: clamp(840px, calc(840px + 160 * (100vw - 1200px) / 720), 1000px);
}
```

### 禁用 clamp
```css
/* 配置: autoClampLinear: false */
/* 输入 */
.element {
  width: linear-vpx(840, 1000, 1200, 1920);
}

/* 输出 */
.element {
  width: calc(840px + 160 * (100vw - 1200px) / 720);
}
```

### 使用默认视口区间
```css
/* 配置: linearMinWidth: 375, linearMaxWidth: 1920 */
/* 输入 */
.element {
  font-size: linear-vpx(16, 24);
}

/* 输出 */
.element {
  font-size: clamp(16px, calc(16px + 8 * (100vw - 375px) / 1545), 24px);
}
```

## 公式说明

生成的 calc 表达式基于线性插值公式：

```
value = minValue + (maxValue - minValue) * (100vw - minWidth) / (maxWidth - minWidth)
```

其中：
- `minValue`: 最小值
- `maxValue`: 最大值
- `minWidth`: 最小视口宽度
- `maxWidth`: 最大视口宽度
- `100vw`: 当前视口宽度

## 特性

### 1. 支持负数
```css
.element {
  margin-left: linear-vpx(-100, -50, 1200, 1920);
}
/* 输出 */
.element {
  margin-left: clamp(-100px, calc(-100px + 50 * (100vw - 1200px) / 720), -50px);
}
```

### 2. 支持小数
```css
.element {
  font-size: linear-vpx(16.5, 18.2, 375, 768);
}
```

### 3. 媒体查询独立配置
不同的媒体查询可以使用不同的视口区间和配置。

### 4. 混合使用
可以与 `vpx`、`maxvpx`、`minvpx`、`cvpx` 混合使用。

### 5. 黑名单支持
`selectorBlackList` 和 `variableBlackList` 对 `linear-vpx` 同样生效。

## 使用场景

### 1. 响应式字体大小
```css
.title {
  font-size: linear-vpx(24, 48, 375, 1920);
}
```

### 2. 响应式间距
```css
.container {
  padding: linear-vpx(20, 60, 768, 1920);
  gap: linear-vpx(16, 32, 375, 1920);
}
```

### 3. 响应式尺寸
```css
.card {
  width: linear-vpx(300, 500, 768, 1920);
  border-radius: linear-vpx(8, 16, 375, 1920);
}
```

### 4. 多断点响应式设计
```css
/* 小屏幕 */
.hero {
  height: linear-vpx(400, 500);
}

/* 中等屏幕 */
@media (min-width: 768px) {
  .hero {
    height: linear-vpx(500, 700);
  }
}

/* 大屏幕 */
@media (min-width: 1440px) {
  .hero {
    height: linear-vpx(700, 900);
  }
}
```

## 优势

1. **无需媒体查询断点**：属性值自动随视口平滑过渡
2. **语法简洁**：比手写 calc 表达式更简洁清晰
3. **精确控制**：可以指定具体的数值范围和视口范围
4. **灵活配置**：支持全局和媒体查询级别的配置
5. **安全边界**：默认使用 clamp 限制，避免极端值

## 注意事项

1. **浮点数精度**：JavaScript 浮点数运算可能产生微小误差，已通过 `toFixed(10)` 处理
2. **视口区间**：确保 `maxWidth > minWidth`，否则会产生除零错误
3. **clamp 兼容性**：需要浏览器支持 CSS `clamp()` 函数（现代浏览器均支持）
4. **性能考虑**：大量使用 calc 可能对渲染性能有轻微影响

## 测试

运行测试：
```bash
npm test
```

查看演示：
```bash
node demo/linear-vpx-demo.js
```

## 更新日志

- v1.6.0: 新增 `linear-vpx()` 函数支持
  - 支持 2 参数和 4 参数形式
  - 支持媒体查询独立配置
  - 支持 `autoClampLinear` 开关
  - 完整的测试覆盖
