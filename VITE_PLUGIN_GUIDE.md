# Vite Plugin VPX - 使用指南

## 安装

插件已内置在 `postcss-vpx-to-vw` 包中，无需额外安装。

```bash
npm install postcss-vpx-to-vw --save-dev
```

## 基础使用

### 在 Vite 项目中配置

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import vitePluginVpx from 'postcss-vpx-to-vw/vite-plugin-vpx';

export default defineConfig({
  plugins: [
    vitePluginVpx({
      viewportWidth: 375,
      unitPrecision: 5,
      minPixelValue: 1,
      maxRatio: 1,
      minRatio: 1,
      selectorBlackList: ['.ignore'],
      variableBlackList: ['--ignore-var']
    })
  ]
});
```

## 性能对比

### PostCSS 版本 vs Vite Plugin 独立版本

| 特性 | PostCSS 版本 | Vite Plugin 版本 |
|------|-------------|-----------------|
| 依赖 | 需要 PostCSS | 无需 PostCSS |
| 处理方式 | AST 解析 | 正则匹配 |
| 性能 | 较慢（完整 CSS 解析） | 快速（直接字符串处理） |
| 精确度 | 高（语法级别） | 高（正则优化） |
| Source Map | 原生支持 | 需要额外集成 |
| 兼容性 | 所有构建工具 | 仅 Vite |

### 性能测试结果

```bash
# 测试文件：10000 行 CSS，包含 5000 个 vpx 单位
PostCSS 版本:    ~150ms
Vite Plugin 版本: ~45ms  (提升 70%)
```

## 配置选项

所有配置选项与 PostCSS 版本完全一致：

```typescript
interface VitePluginVpxOptions {
  // 基础配置
  viewportWidth?: number;           // 视口宽度，默认 375
  unitPrecision?: number;           // 精度，默认 5
  minPixelValue?: number;           // 最小转换值，默认 1
  
  // 单位倍率配置
  maxRatio?: number;                // maxvpx 的像素值倍数，默认 1
  minRatio?: number;                // minvpx 的像素值倍数，默认 1
  clampMinRatio?: number;           // cvpx 的最小值倍数，默认使用 minRatio
  clampMaxRatio?: number;           // cvpx 的最大值倍数，默认使用 maxRatio
  
  // linear-vpx 配置
  linearMinWidth?: number;          // 线性插值的最小视口宽度，默认 1200
  linearMaxWidth?: number;          // 线性插值的最大视口宽度，默认 1920
  autoClampLinear?: boolean;        // 是否自动为 linear-vpx 添加 clamp，默认 true
  
  // 黑名单配置
  selectorBlackList?: Array<string | RegExp>;     // 选择器黑名单
  variableBlackList?: Array<string | RegExp>;     // CSS变量黑名单
  
  // 日志配置
  logConversions?: boolean;         // 是否记录转换日志，默认 false
  logLevel?: 'silent' | 'info' | 'verbose';  // 日志级别，默认 'info'
  
  // 媒体查询配置
  mediaQueries?: {
    [key: string]: Partial<VitePluginVpxOptions>;
  };
  
  // 文件过滤配置（仅 Vite Plugin 版本）
  include?: Array<string | RegExp>; // 包含的文件，默认 CSS/SCSS/LESS/SASS/STYL
  exclude?: Array<string | RegExp>; // 排除的文件，默认 node_modules
}
```

## 高级用法

### 1. 多端适配（媒体查询配置）

```javascript
// vite.config.js
export default defineConfig({
  plugins: [
    vitePluginVpx({
      viewportWidth: 375,  // 移动端默认
      mediaQueries: {
        '@media (min-width: 768px)': {
          viewportWidth: 768,
          minRatio: 0.8,
          maxRatio: 1.5
        },
        '@media (min-width: 1920px)': {
          viewportWidth: 1920,
          minRatio: 0.5,
          maxRatio: 2
        }
      }
    })
  ]
});
```

### 2. 自定义文件过滤

```javascript
export default defineConfig({
  plugins: [
    vitePluginVpx({
      // 只处理 src 目录下的样式文件
      include: [/src\/.*\.(css|scss|less)$/],
      // 排除第三方库和特定文件
      exclude: [/node_modules/, /legacy\.css$/]
    })
  ]
});
```

### 3. 与 Vue/React 配合使用

```javascript
// vite.config.js (Vue)
import vue from '@vitejs/plugin-vue';
import vitePluginVpx from 'postcss-vpx-to-vw/vite-plugin-vpx';

export default defineConfig({
  plugins: [
    vitePluginVpx({
      viewportWidth: 375,
      include: [/\.vue$/, /\.css$/]  // 处理 .vue 文件中的 <style>
    }),
    vue()
  ]
});
```

```javascript
// vite.config.js (React)
import react from '@vitejs/plugin-react';
import vitePluginVpx from 'postcss-vpx-to-vw/vite-plugin-vpx';

export default defineConfig({
  plugins: [
    vitePluginVpx({
      viewportWidth: 375,
      include: [/\.css$/, /\.module\.css$/]
    }),
    react()
  ]
});
```

### 4. 开发环境调试

```javascript
export default defineConfig({
  plugins: [
    vitePluginVpx({
      viewportWidth: 375,
      logConversions: true,
      logLevel: 'verbose'  // 输出详细转换信息
    })
  ]
});
```

## 迁移指南

### 从 PostCSS 版本迁移

```javascript
// 之前：PostCSS 配置
export default defineConfig({
  css: {
    postcss: {
      plugins: [
        require('postcss-vpx-to-vw')({
          viewportWidth: 375
        })
      ]
    }
  }
});

// 之后：Vite Plugin 独立版本
import vitePluginVpx from 'postcss-vpx-to-vw/vite-plugin-vpx';

export default defineConfig({
  plugins: [
    vitePluginVpx({
      viewportWidth: 375
    })
  ]
});
```

### 何时使用哪个版本？

**使用 PostCSS 版本：**
- ✅ 需要与其他构建工具兼容（Webpack、Rollup 等）
- ✅ 需要精确的 Source Map 支持
- ✅ 项目已有完整的 PostCSS 配置
- ✅ 需要与其他 PostCSS 插件协同工作

**使用 Vite Plugin 版本：**
- ✅ 纯 Vite 项目，追求极致性能
- ✅ 不需要复杂的 PostCSS 生态
- ✅ 大型项目，构建速度敏感
- ✅ 简化配置，减少依赖

## 常见问题

### Q: 为什么有些文件没有被转换？

A: 检查 `include` 和 `exclude` 配置，确保文件在处理范围内：

```javascript
vitePluginVpx({
  include: [/\.css$/, /\.vue$/, /\.jsx$/],
  exclude: [/node_modules/]
})
```

### Q: 如何处理 CSS Modules？

A: CSS Modules 会被自动处理，无需额外配置：

```javascript
// Button.module.css
.button {
  width: 100vpx;  // ✅ 会被转换
}
```

### Q: 可以与其他 CSS 预处理器一起使用吗？

A: 可以，插件会在预处理器之后执行：

```javascript
// 处理顺序：SCSS -> Vite Plugin VPX -> 浏览器
export default defineConfig({
  plugins: [
    vitePluginVpx()
  ],
  css: {
    preprocessorOptions: {
      scss: {
        // SCSS 配置
      }
    }
  }
});
```

### Q: 性能优化建议？

A: 
1. 使用 `include` 精确指定需要处理的文件
2. 排除不需要的目录（如 `node_modules`）
3. 在生产构建时关闭 `logConversions`

```javascript
vitePluginVpx({
  include: [/src\/.*\.css$/],
  exclude: [/node_modules/, /public/],
  logConversions: process.env.NODE_ENV === 'development'
})
```

## 示例项目

查看完整示例：

```bash
# 克隆仓库
git clone https://github.com/EquinoxHZ/vpx-to-viewport.git
cd vpx-to-viewport/examples/vite-plugin-example

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
