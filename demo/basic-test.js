const postcss = require('postcss');
const vpxToVw = require('../index');

// 基本功能测试
const basicCSS = `
.container {
  width: 375vpx;
  height: 200vpx;
  font-size: 16vpx;
  margin: 10vpx 20vpx;
  padding: 5vpx;
}

.ignore-me {
  width: 100vpx;
  height: 50vpx;
}

:root {
  --main-width: 300vpx;
  --ignore-var: 200vpx;
}

.mixed {
  width: calc(100% - 20vpx);
  height: 1vpx; /* 这个应该转换为px，因为小于minPixelValue */
}
`;

// 新功能测试（maxvpx/minvpx）
const newFeaturesCSS = `
.test {
  /* 基本 vpx 转换 */
  font-size: 36vpx;

  /* maxvpx 转换 */
  max-width: 600maxvpx;

  /* minvpx 转换 */
  min-width: 200minvpx;

  /* 混合使用 */
  margin: 10vpx 20maxvpx 15minvpx 25vpx;
  padding: 5vpx 10maxvpx;

  /* 小数值 */
  border-radius: 8.5maxvpx;
  line-height: 1.2minvpx;

  /* 复杂场景 */
  box-shadow: 0 2vpx 4maxvpx rgba(0,0,0,0.1), 0 1minvpx 2vpx rgba(0,0,0,0.05);
}

.responsive {
  font-size: 24maxvpx; /* 最小不小于 24px */
  padding: 16minvpx; /* 最大不超过 16px */
  width: 300maxvpx;
  max-width: 90minvpx;
}
`;

async function runTests() {
  console.log('🧪 PostCSS VPX to VW 插件功能测试\n');

  // 测试 1: 基本转换
  console.log('📋 测试 1: 基本 vpx 转换');
  const result1 = await postcss([vpxToVw()]).process(basicCSS, { from: undefined });
  console.log('输出:');
  console.log(result1.css);
  console.log('\n' + '='.repeat(50) + '\n');

  // 测试 2: 自定义视口宽度
  console.log('📋 测试 2: 自定义视口宽度 (750px)');
  const result2 = await postcss([vpxToVw({ viewportWidth: 750 })]).process(basicCSS, { from: undefined });
  console.log('输出:');
  console.log(result2.css);
  console.log('\n' + '='.repeat(50) + '\n');

  // 测试 3: 选择器黑名单
  console.log('📋 测试 3: 选择器黑名单');
  const result3 = await postcss([vpxToVw({ selectorBlackList: ['.ignore-me'] })]).process(basicCSS, { from: undefined });
  console.log('输出:');
  console.log(result3.css);
  console.log('\n' + '='.repeat(50) + '\n');

  // 测试 4: CSS变量黑名单
  console.log('📋 测试 4: CSS变量黑名单');
  const result4 = await postcss([vpxToVw({ variableBlackList: ['--ignore-var'] })]).process(basicCSS, { from: undefined });
  console.log('输出:');
  console.log(result4.css);
  console.log('\n' + '='.repeat(50) + '\n');

  // 测试 5: 新功能（maxvpx/minvpx）
  console.log('📋 测试 5: 新功能 (maxvpx/minvpx)');
  const result5 = await postcss([vpxToVw()]).process(newFeaturesCSS, { from: undefined });
  console.log('输出:');
  console.log(result5.css);
  console.log('\n' + '='.repeat(50) + '\n');


  // 测试 6: 最小转换值设置为 2px
  console.log('📋 测试 6: 最小转换值设置为 2px');
  const result6 = await postcss([vpxToVw({ minPixelValue: 2 })]).process(basicCSS, { from: undefined });
  console.log('输出:');
  console.log(result6.css);
  console.log('\n' + '='.repeat(50) + '\n');

  // 测试 7: maxRatio 参数测试
  console.log('📋 测试 7: maxRatio 参数测试 (maxRatio: 1.5)');
  const result7 = await postcss([vpxToVw({ maxRatio: 1.5 })]).process(newFeaturesCSS, { from: undefined });
  console.log('输出:');
  console.log(result7.css);
  console.log('\n' + '='.repeat(50) + '\n');

  // 测试 8: minRatio 参数测试
  console.log('📋 测试 8: minRatio 参数测试 (minRatio: 0.8)');
  const result8 = await postcss([vpxToVw({ minRatio: 0.8 })]).process(newFeaturesCSS, { from: undefined });
  console.log('输出:');
  console.log(result8.css);
  console.log('\n' + '='.repeat(50) + '\n');

  // 测试 9: 同时使用 maxRatio 和 minRatio
  console.log('📋 测试 9: 同时使用 maxRatio 和 minRatio');
  const result9 = await postcss([vpxToVw({ maxRatio: 1.2, minRatio: 0.9 })]).process(newFeaturesCSS, { from: undefined });
  console.log('输出:');
  console.log(result9.css);
  console.log('\n' + '='.repeat(50) + '\n');

  console.log('✅ 所有功能测试完成！');
}

runTests().catch(console.error);
