# PostCSS VPX to VW 插件测试指南

## 📋 测试概述

这个项目包含了全面的测试套件，确保 PostCSS VPX to VW 插件的所有功能都能正常工作。

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 运行所有测试
```bash
npm test
```

### 3. 运行测试并生成覆盖率报告
```bash
npm test -- --coverage
```

### 4. 持续监控模式
```bash
npm run test:watch
```

### 5. 代码检查
```bash
npm run lint
```

## 📊 测试类型

### 1. 单元测试 (`index.test.js`)
- **基本转换测试**: 验证 vpx 到 vw 的基本转换功能
- **配置项测试**: 验证所有配置项的功能
- **边界情况测试**: 验证边界条件和错误处理
- **黑名单测试**: 验证选择器和变量黑名单功能

### 2. 手动测试 (`manual-test.js`)
```bash
node manual-test.js
```
- 全面的功能演示
- 不同配置的对比测试
- 可视化输出结果

### 3. 性能测试 (`performance-test.js`)
```bash
node performance-test.js
```
- 大规模CSS处理性能测试
- 处理时间统计
- 转换成功率分析

## 📈 当前测试覆盖率

| 指标 | 覆盖率 |
|------|--------|
| 语句覆盖率 | 96.96% |
| 分支覆盖率 | 88.88% |
| 函数覆盖率 | 100% |
| 行覆盖率 | 96.87% |

## ✅ 测试用例详解

### 基本功能测试
- ✅ 基本 vpx 到 vw 转换
- ✅ 小数值处理
- ✅ 多个 vpx 值在同一声明中
- ✅ 非 vpx 值保持不变

### 配置项测试
- ✅ `minPixelValue` 最小转换值
- ✅ `viewportWidth` 视口宽度设置
- ✅ `unitPrecision` 精度控制
- ✅ `selectorBlackList` 选择器黑名单
- ✅ `variableBlackList` CSS变量黑名单

### 高级功能测试
- ✅ 正则表达式黑名单
- ✅ CSS变量处理
- ✅ 错误值处理
- ✅ 空配置处理

## 🔧 测试配置

### Jest 配置 (`jest.config.js`)
```javascript
module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: ['index.js'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};
```

### 测试环境要求
- Node.js >= 14.0.0
- PostCSS ^8.0.0

## 📝 添加新测试

### 1. 单元测试
在 `index.test.js` 中添加新的测试用例：

```javascript
test('should handle new feature', async () => {
  const input = 'your-test-css';
  const expected = 'expected-output';
  const result = await processCSS(input, { /* options */ });
  expect(result.css).toBe(expected);
});
```

### 2. 手动测试
在 `manual-test.js` 中添加新的测试场景。

### 3. 性能测试
在 `performance-test.js` 中添加性能基准测试。

## 🐛 调试测试

### 1. 单个测试运行
```bash
npx jest --testNamePattern="should convert vpx to vw"
```

### 2. 调试模式
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

### 3. 详细输出
```bash
npm test -- --verbose
```

## 🚀 CI/CD 集成

项目包含 GitHub Actions 配置 (`.github/workflows/ci.yml`)，支持：
- 多 Node.js 版本测试 (14.x, 16.x, 18.x)
- 自动运行测试和代码检查
- 代码覆盖率报告上传

## 📋 测试检查清单

发布前请确保：
- [ ] 所有测试通过
- [ ] 代码覆盖率 > 95%
- [ ] 代码检查无错误
- [ ] 手动测试验证功能
- [ ] 性能测试结果正常

## 🆘 常见问题

### Q: 测试失败怎么办？
A: 检查错误信息，确保依赖正确安装，代码语法正确。

### Q: 覆盖率不够高怎么办？
A: 添加更多测试用例覆盖未测试的代码分支。

### Q: 性能测试结果异常怎么办？
A: 检查测试环境，确保没有其他进程影响性能测试。

## 📞 支持

如有测试相关问题，请：
1. 查看测试输出错误信息
2. 检查相关文档
3. 提交 Issue 或 Pull Request
