const postcss = require('postcss');
const vpxToVw = require('../index');

// 用于测试 maxRatio 和 minRatio 的 CSS
const ratioTestCSS = `
/* 基础测试 */
.base-test {
  font-size: 20maxvpx;
  line-height: 30minvpx;
  margin: 10vpx;
}

/* 复杂场景测试 */
.complex-test {
  /* 混合使用 */
  margin: 5vpx 10maxvpx 15minvpx 20vpx;
  padding: 8maxvpx 12minvpx;

  /* 小数值测试 */
  border-radius: 6.5maxvpx;
  letter-spacing: 0.8minvpx;

  /* 多个值组合 */
  box-shadow: 0 2maxvpx 4minvpx rgba(0,0,0,0.1),
              0 1vpx 2maxvpx rgba(0,0,0,0.05);
}

/* 响应式布局测试 */
.responsive-layout {
  width: 300maxvpx;
  max-width: 600minvpx;
  height: 200maxvpx;
  min-height: 100minvpx;
  padding: 20maxvpx 30minvpx;
  gap: 15maxvpx;
}
`;

async function testRatioFeatures() {
  console.log('🧪 maxRatio 和 minRatio 参数测试\n');

  // 测试 1: 默认配置 (maxRatio: 1, minRatio: 1)
  console.log('📋 测试 1: 默认配置 (maxRatio: 1, minRatio: 1)');
  const result1 = await postcss([
    vpxToVw({
      viewportWidth: 375,
      unitPrecision: 3
    })
  ]).process(ratioTestCSS, { from: undefined });
  console.log('输出:');
  console.log(result1.css);
  console.log('\\n' + '='.repeat(60) + '\\n');

  // 测试 2: 增加 maxRatio
  console.log('📋 测试 2: 增加 maxRatio = 1.5 (maxvpx 的像素值 × 1.5)');
  const result2 = await postcss([
    vpxToVw({
      viewportWidth: 375,
      unitPrecision: 3,
      maxRatio: 1.5
    })
  ]).process(ratioTestCSS, { from: undefined });
  console.log('输出:');
  console.log(result2.css);
  console.log('\\n' + '='.repeat(60) + '\\n');

  // 测试 3: 减少 minRatio
  console.log('📋 测试 3: 减少 minRatio = 0.8 (minvpx 的像素值 × 0.8)');
  const result3 = await postcss([
    vpxToVw({
      viewportWidth: 375,
      unitPrecision: 3,
      minRatio: 0.8
    })
  ]).process(ratioTestCSS, { from: undefined });
  console.log('输出:');
  console.log(result3.css);
  console.log('\\n' + '='.repeat(60) + '\\n');

  // 测试 4: 同时使用 maxRatio 和 minRatio
  console.log('📋 测试 4: 同时使用 maxRatio = 1.2, minRatio = 0.9');
  const result4 = await postcss([
    vpxToVw({
      viewportWidth: 375,
      unitPrecision: 3,
      maxRatio: 1.2,
      minRatio: 0.9
    })
  ]).process(ratioTestCSS, { from: undefined });
  console.log('输出:');
  console.log(result4.css);
  console.log('\\n' + '='.repeat(60) + '\\n');

  // 测试 5: 极端值测试
  console.log('📋 测试 5: 极端值测试 (maxRatio = 2, minRatio = 0.5)');
  const result5 = await postcss([
    vpxToVw({
      viewportWidth: 375,
      unitPrecision: 3,
      maxRatio: 2,
      minRatio: 0.5
    })
  ]).process(ratioTestCSS, { from: undefined });
  console.log('输出:');
  console.log(result5.css);
  console.log('\\n' + '='.repeat(60) + '\\n');

  // 实际应用场景分析
  console.log('🎯 实际应用场景分析:');
  console.log('');
  console.log('  maxRatio > 1 的使用场景:');
  console.log('  • 在大屏幕上需要更大的最小值');
  console.log('  • 确保重要元素在任何设备上都有足够的大小');
  console.log('  • 例如: 按钮、图标、文字等需要保持可用性');
  console.log('');
  console.log('  minRatio < 1 的使用场景:');
  console.log('  • 在小屏幕上需要更紧凑的布局');
  console.log('  • 避免元素在大屏幕上过大');
  console.log('  • 例如: 间距、边框、装饰元素等');
  console.log('');
  console.log('  推荐配置:');
  console.log('  • maxRatio: 1.2 - 1.5 (适度增加最小值)');
  console.log('  • minRatio: 0.8 - 0.9 (适度减少最大值)');
  console.log('');
  console.log('✅ 所有比例参数测试完成！');
}

// 运行测试
testRatioFeatures().catch(console.error);
