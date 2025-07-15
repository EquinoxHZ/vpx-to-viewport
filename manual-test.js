const postcss = require('postcss');
const vpxToVw = require('./index');

// 测试用的CSS
const testCSS = `
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

async function testPlugin() {
  console.log('🚀 开始测试 PostCSS VPX to VW 插件...\n');

  // 测试1: 基本转换
  console.log('📋 测试1: 基本转换');
  const result1 = await postcss([vpxToVw()]).process(testCSS, { from: undefined });
  console.log('输出:');
  console.log(result1.css);
  console.log('\n' + '='.repeat(50) + '\n');

  // 测试2: 自定义视口宽度
  console.log('📋 测试2: 自定义视口宽度 (750px)');
  const result2 = await postcss([vpxToVw({ viewportWidth: 750 })]).process(testCSS, { from: undefined });
  console.log('输出:');
  console.log(result2.css);
  console.log('\n' + '='.repeat(50) + '\n');

  // 测试3: 选择器黑名单
  console.log('📋 测试3: 选择器黑名单');
  const result3 = await postcss([vpxToVw({ selectorBlackList: ['.ignore-me'] })]).process(testCSS, { from: undefined });
  console.log('输出:');
  console.log(result3.css);
  console.log('\n' + '='.repeat(50) + '\n');

  // 测试4: CSS变量黑名单
  console.log('📋 测试4: CSS变量黑名单');
  const result4 = await postcss([vpxToVw({ variableBlackList: ['--ignore-var'] })]).process(testCSS, { from: undefined });
  console.log('输出:');
  console.log(result4.css);
  console.log('\n' + '='.repeat(50) + '\n');

  // 测试5: 最小转换值
  console.log('📋 测试5: 最小转换值设置为2');
  const result5 = await postcss([vpxToVw({ minPixelValue: 2 })]).process(testCSS, { from: undefined });
  console.log('输出:');
  console.log(result5.css);

  console.log('\n✅ 所有测试完成！');
}

testPlugin().catch(console.error);
