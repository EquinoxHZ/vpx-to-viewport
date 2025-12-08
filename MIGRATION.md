# 迁移指南：从 postcss-vpx-to-vw 到 vpx-to-viewport

## 为什么更名？

原包名 `postcss-vpx-to-vw` 只反映了 PostCSS 插件的功能，但现在我们支持：
- ✅ PostCSS Plugin
- ✅ Vite Plugin  
- ✅ Webpack Loader

新包名 `vpx-to-viewport` 更准确地反映了多平台支持。

## 如何迁移

### 1. 卸载旧包

```bash
npm uninstall postcss-vpx-to-vw
```

### 2. 安装新包

```bash
npm install vpx-to-viewport --save-dev
```

### 3. 更新代码引用

#### PostCSS 配置

**旧代码：**
```javascript
module.exports = {
  plugins: [
    require('postcss-vpx-to-vw')({
      viewportWidth: 375,
      unitPrecision: 5
    })
  ]
}
```

**新代码：**
```javascript
module.exports = {
  plugins: [
    require('vpx-to-viewport')({
      viewportWidth: 375,
      unitPrecision: 5
    })
  ]
}
```

#### Vite Plugin

**旧代码：**
```javascript
import vitePluginVpx from 'postcss-vpx-to-vw/vite-plugin-vpx';

export default {
  plugins: [
    vitePluginVpx({
      viewportWidth: 375
    })
  ]
}
```

**新代码：**
```javascript
import vitePluginVpx from 'vpx-to-viewport/vite-plugin-vpx';

export default {
  plugins: [
    vitePluginVpx({
      viewportWidth: 375
    })
  ]
}
```

#### Webpack Loader

**旧代码：**
```javascript
{
  test: /\.css$/,
  use: [
    'style-loader',
    'css-loader',
    {
      loader: 'postcss-vpx-to-vw/webpack-loader-vpx',
      options: {
        viewportWidth: 375
      }
    }
  ]
}
```

**新代码：**
```javascript
{
  test: /\.css$/,
  use: [
    'style-loader',
    'css-loader',
    {
      loader: 'vpx-to-viewport/webpack-loader-vpx',
      options: {
        viewportWidth: 375
      }
    }
  ]
}
```

## 功能完全兼容

✅ 所有 API 保持不变  
✅ 所有配置选项兼容  
✅ 转换逻辑完全相同  
✅ 只需要更改包名引用

## 常见问题

### Q: 旧包还能用吗？
A: 可以，但已标记为废弃。建议尽快迁移到新包。

### Q: 新包有什么改进？
A: 
- 新增 Webpack Loader 支持
- 代码重构，减少 41.5% 重复代码
- 统一核心转换逻辑
- 更好的性能（Vite/Webpack 版本快 6-9 倍）

### Q: 需要改配置吗？
A: 不需要！所有配置选项完全兼容，只需要改包名。

### Q: TypeScript 类型定义？
A: 新包包含完整的 TypeScript 类型定义文件。

## 获取帮助

- 📖 [文档](https://github.com/EquinoxHZ/vpx-to-viewport)
- 🐛 [报告问题](https://github.com/EquinoxHZ/vpx-to-viewport/issues)
- 💬 [讨论](https://github.com/EquinoxHZ/vpx-to-viewport/discussions)
