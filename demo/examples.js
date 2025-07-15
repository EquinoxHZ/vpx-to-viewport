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

  const result = await postcss([
    vpxToVw({
      viewportWidth: 375,
      unitPrecision: 3
    })
  ]).process(realWorldCSS, { from: undefined });

  console.log('🎯 应用场景说明:');
  console.log('  - maxvpx: 在小屏幕上设置最小值，防止元素过小');
  console.log('  - minvpx: 在大屏幕上设置最大值，防止元素过大');
  console.log('  - vpx: 完全响应式缩放');
  console.log('');

  console.log('📝 转换结果:');
  console.log(result.css);

  console.log('\n💡 这样的设计可以：');
  console.log('  ✅ 在手机上提供合适的大小');
  console.log('  ✅ 在平板上保持良好的比例');
  console.log('  ✅ 在桌面上避免过大或过小');
  console.log('  ✅ 确保文本始终可读');
  console.log('  ✅ 保持UI元素的可点击性');
}

demonstrateRealWorldUsage().catch(console.error);
