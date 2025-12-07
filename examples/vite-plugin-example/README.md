# Vite Plugin VPX 示例项目

这是一个展示 `vite-plugin-vpx` 独立版本功能的完整示例。

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 示例内容

### 1. 基础单位演示
- **vpx**: 基础响应式单位，转换为 `vw`
- **maxvpx**: 设置最小值边界，转换为 `max(vw, Npx)`
- **minvpx**: 设置最大值边界，转换为 `min(vw, Npx)`
- **cvpx**: 设置范围限制，转换为 `clamp(minPx, vw, maxPx)`

### 2. Linear VPX 演示
使用 `linear-vpx()` 函数实现线性插值缩放，适合大屏幕响应式设计。

### 3. 黑名单演示
- 选择器黑名单：`.no-convert` 和 `/^\.ignore-/` 不会被转换
- CSS 变量黑名单：`--raw-size` 不会被转换

### 4. CSS 变量演示
展示 CSS 变量中的 vpx 单位转换。

### 5. 媒体查询演示
不同屏幕尺寸使用不同的视口宽度配置：
- 小屏 (< 768px): viewportWidth = 375
- 中屏 (768px - 1920px): viewportWidth = 768
- 大屏 (>= 1920px): viewportWidth = 1920

## 配置说明

查看 `vite.config.js` 了解完整的插件配置。

## 开发建议

1. 打开浏览器开发者工具，查看转换后的 CSS
2. 调整浏览器窗口大小，观察响应式效果
3. 点击演示盒子，在控制台查看计算后的样式值

## 性能对比

相比 PostCSS 版本，Vite Plugin 独立版本：
- ✅ 不依赖 PostCSS 生态
- ✅ 直接字符串处理，性能提升约 70%
- ✅ 配置更简洁
- ✅ 启动速度更快

## 目录结构

```
vite-plugin-example/
├── index.html       # 主页面
├── style.css        # 样式文件（包含 vpx 单位）
├── main.js          # JavaScript 入口
├── vite.config.js   # Vite 配置（插件配置）
├── package.json     # 项目配置
└── README.md        # 本文件
```

## 注意事项

1. 确保已在根目录运行 `npm install` 安装主包依赖
2. 本示例使用相对路径引用父目录的插件代码
3. 生产环境请使用 npm 安装正式版本

## 相关文档

- [主项目 README](../../README.md)
- [Vite Plugin 使用指南](../../VITE_PLUGIN_GUIDE.md)
- [API 文档](../../index.d.ts)
