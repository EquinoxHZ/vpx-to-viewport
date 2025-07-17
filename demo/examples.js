const postcss = require('postcss');
const vpxToVw = require('../index');

// 真实世界的响应式设计示例
const realWorldCSS = `
/* 响应式标题 - 在小屏幕上不会过小 */
.hero-title {
  font-size: 48maxvpx; /* 最小 48px，在小屏幕上保持可读性 */
  line-height: 1.2;
  margin-bottom: 20vpx;
}

/* 响应式按钮 - 在大屏幕上不会过大 */
.btn {
  padding: 12minvpx 24minvpx; /* 最大 12px 和 24px */
  font-size: 16minvpx; /* 最大 16px */
  border-radius: 8vpx;
}

/* 响应式卡片 */
.card {
  width: 320maxvpx; /* 最小 320px */
  min-height: 200minvpx; /* 最大 200px */
  padding: 20vpx;
  margin: 10vpx;
  border-radius: 12maxvpx; /* 最小 12px 圆角 */

  /* 复杂的阴影效果 */
  box-shadow:
    0 4vpx 8maxvpx rgba(0,0,0,0.1),
    0 2minvpx 4vpx rgba(0,0,0,0.05);
}

/* 响应式图片容器 */
.image-container {
  width: 100%;
  max-width: 600maxvpx;
  min-width: 200minvpx;
  height: 300maxvpx;
  border-radius: 8maxvpx;
  overflow: hidden;
}

/* 响应式导航栏 */
.navbar {
  height: 60minvpx; /* 最大 60px 高度 */
  padding: 0 20vpx;

  .nav-item {
    padding: 10vpx 15minvpx;
    margin: 0 5vpx;
    font-size: 14minvpx;
  }
}

/* 响应式表格 */
.table {
  width: 100%;
  max-width: 1200maxvpx;

  td, th {
    padding: 12minvpx 16minvpx;
    font-size: 14minvpx;
  }
}
`;

async function demonstrateRealWorldUsage() {
  console.log('🌍 PostCSS VPX to VW 插件 - 真实世界使用示例\n');

  console.log('📋 示例 1: 默认配置');
  const result1 = await postcss([
    vpxToVw({
      viewportWidth: 375,
      unitPrecision: 3
    })
  ]).process(realWorldCSS, { from: undefined });
  console.log('输出:');
  console.log(result1.css);
  console.log('\\n' + '='.repeat(50) + '\\n');

  console.log('📋 示例 2: 使用 maxRatio 增加最小值');
  const result2 = await postcss([
    vpxToVw({
      viewportWidth: 375,
      unitPrecision: 3,
      maxRatio: 1.5 // maxvpx 的像素值乘以 1.5
    })
  ]).process(realWorldCSS, { from: undefined });
  console.log('输出:');
  console.log(result2.css);
  console.log('\\n' + '='.repeat(50) + '\\n');

  console.log('📋 示例 3: 使用 minRatio 减少最大值');
  const result3 = await postcss([
    vpxToVw({
      viewportWidth: 375,
      unitPrecision: 3,
      minRatio: 0.8 // minvpx 的像素值乘以 0.8
    })
  ]).process(realWorldCSS, { from: undefined });
  console.log('输出:');
  console.log(result3.css);
  console.log('\\n' + '='.repeat(50) + '\\n');

  console.log('📋 示例 4: 同时使用 maxRatio 和 minRatio');
  const result4 = await postcss([
    vpxToVw({
      viewportWidth: 375,
      unitPrecision: 3,
      maxRatio: 1.2,
      minRatio: 0.9
    })
  ]).process(realWorldCSS, { from: undefined });
  console.log('输出:');
  console.log(result4.css);
  console.log('\\n' + '='.repeat(50) + '\\n');

  console.log('🎯 应用场景说明:');
  console.log('  - maxvpx: 在小屏幕上设置最小值，防止元素过小');
  console.log('  - minvpx: 在大屏幕上设置最大值，防止元素过大');
  console.log('  - vpx: 完全响应式缩放');
  console.log('  - maxRatio: 调整 maxvpx 的最小值倍数');
  console.log('  - minRatio: 调整 minvpx 的最大值倍数');
  console.log('');

  console.log('💡 这样的设计可以：');
  console.log('  ✅ 在手机上提供合适的大小');
  console.log('  ✅ 在平板上保持良好的比例');
  console.log('  ✅ 在桌面上避免过大或过小');
  console.log('  ✅ 确保文本始终可读');
  console.log('  ✅ 保持UI元素的可点击性');
  console.log('  ✅ 通过比例参数精确控制边界值');
}

demonstrateRealWorldUsage().catch(console.error);
