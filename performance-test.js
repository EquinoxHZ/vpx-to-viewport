const postcss = require('postcss');
const vpxToVw = require('./index');

// 生成大量的CSS用于性能测试
function generateLargeCSS() {
  let css = '';
  for (let i = 0; i < 1000; i++) {
    css += `
.class-${i} {
  width: ${Math.floor(Math.random() * 500)}vpx;
  height: ${Math.floor(Math.random() * 500)}vpx;
  font-size: ${Math.floor(Math.random() * 30) + 10}vpx;
  margin: ${Math.floor(Math.random() * 50)}vpx ${Math.floor(Math.random() * 50)}vpx;
  padding: ${Math.floor(Math.random() * 30)}vpx;
}`;
  }
  return css;
}

async function performanceTest() {
  console.log('🚀 开始性能测试...\n');

  const largeCSS = generateLargeCSS();
  console.log(`📊 生成的CSS包含 ${largeCSS.split('\n').length} 行代码`);

  const startTime = process.hrtime.bigint();

  const result = await postcss([vpxToVw()]).process(largeCSS, { from: undefined });

  const endTime = process.hrtime.bigint();
  const processingTime = Number(endTime - startTime) / 1000000; // 转换为毫秒

  console.log(`⚡ 处理时间: ${processingTime.toFixed(2)}ms`);
  console.log(`📏 输出CSS长度: ${result.css.length} 字符`);
  console.log(`🔢 平均每行处理时间: ${(processingTime / largeCSS.split('\n').length).toFixed(4)}ms`);

  // 检查是否有转换
  const originalVpxCount = (largeCSS.match(/vpx/g) || []).length;
  const resultVpxCount = (result.css.match(/vpx/g) || []).length;
  const resultVwCount = (result.css.match(/vw/g) || []).length;

  console.log(`\n📈 转换统计:`);
  console.log(`  原始vpx数量: ${originalVpxCount}`);
  console.log(`  转换后vpx数量: ${resultVpxCount}`);
  console.log(`  转换后vw数量: ${resultVwCount}`);
  console.log(`  转换成功率: ${((originalVpxCount - resultVpxCount) / originalVpxCount * 100).toFixed(2)}%`);

  console.log('\n✅ 性能测试完成！');
}

performanceTest().catch(console.error);
