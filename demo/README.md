# Demo 和测试文件

这个目录包含了插件的演示和测试文件，用于开发和验证插件功能。

## 文件说明

### 📖 演示文件
- `examples.js` - 真实世界使用示例，展示各种响应式设计场景
- `benchmark.js` - 性能基准测试，评估插件的处理效率

### 🧪 测试文件
- `basic-test.js` - 基本功能测试，涵盖所有核心特性
- `ratio-test.js` - 专门测试 maxRatio 和 minRatio 参数功能

### 🔧 验证文件
- `validate.js` - 插件验证器，确保插件符合 PostCSS 规范

### 📚 文档
- `README.md` - 当前文件，说明各个文件的用途
- `TEST_GUIDE.md` - 详细的测试指南

## 运行方式

使用 npm 脚本来运行这些文件：

```bash
# 运行基本功能测试
npm run demo:basic

# 运行比例参数测试
npm run demo:ratio

# 运行真实世界使用示例
npm run demo:examples

# 运行性能基准测试
npm run demo:benchmark

# 验证插件规范
npm run demo:validate
```

## 文件功能详解

### basic-test.js - 基本功能测试
测试插件的所有核心功能：
- 基本 vpx 转换
- maxvpx 和 minvpx 转换
- 选择器和变量黑名单
- 最小转换值设置
- maxRatio 和 minRatio 参数

### ratio-test.js - 比例参数测试
专门测试新增的比例参数功能：
- maxRatio 参数效果演示
- minRatio 参数效果演示
- 同时使用两个参数的效果
- 极端值测试
- 实际应用场景分析

### examples.js - 真实世界示例
展示在实际项目中如何使用 vpx、maxvpx 和 minvpx 单位：
- 响应式标题和按钮
- 卡片和容器布局
- 导航栏和表格设计
- 复杂的阴影效果
- 不同比例参数的实际效果

### benchmark.js - 性能测试
生成大量 CSS 代码来测试插件的性能：
- 处理时间统计
- 内存使用情况
- 转换成功率分析

### validate.js - 插件验证
验证插件是否符合 PostCSS 标准：
- 插件导出检查
- 实例化测试
- 方法存在性验证

## 开发说明

- 这些文件不会被发布到 npm
- 所有演示基于默认配置（375px 视口宽度）
- 文件中的 console.log 语句用于调试和演示
- 可以根据需要修改和扩展这些示例
