/**
 * PostCSS 版本 vs Vite Plugin 版本性能对比测试
 */

const postcss = require('postcss');
const vpxToVwPostCSS = require('./index.js');
const vitePluginVpx = require('./vite-plugin-vpx.js');

// 生成测试 CSS
function generateTestCSS(ruleCount) {
  let css = '';
  for (let i = 0; i < ruleCount; i++) {
    css += `
.test-${i} {
  width: ${i}vpx;
  height: ${i * 2}vpx;
  margin: ${i}vpx ${i * 2}vpx;
  padding: ${i}maxvpx ${i * 2}minvpx;
  font-size: ${i}cvpx;
}
`;
  }
  return css;
}

// 测试 PostCSS 版本
async function testPostCSS(css, iterations = 1) {
  const plugin = vpxToVwPostCSS({
    viewportWidth: 375,
    unitPrecision: 5,
    logConversions: false,
  });

  const startTime = Date.now();

  for (let i = 0; i < iterations; i++) {
    await postcss([plugin]).process(css, { from: undefined });
  }

  const endTime = Date.now();
  return endTime - startTime;
}

// 测试 Vite Plugin 版本
function testVitePlugin(css, iterations = 1) {
  const plugin = vitePluginVpx({
    viewportWidth: 375,
    unitPrecision: 5,
    logConversions: false,
  });

  const startTime = Date.now();

  for (let i = 0; i < iterations; i++) {
    plugin.transform(css, 'test.css');
  }

  const endTime = Date.now();
  return endTime - startTime;
}

// 运行性能测试
async function runBenchmark() {
  console.log('🚀 PostCSS 版本 vs Vite Plugin 版本性能对比\n');
  console.log('='.repeat(80));

  const testCases = [
    { name: '小型文件', rules: 100, iterations: 100 },
    { name: '中型文件', rules: 500, iterations: 50 },
    { name: '大型文件', rules: 1000, iterations: 20 },
    { name: '超大型文件', rules: 5000, iterations: 5 },
  ];

  for (const testCase of testCases) {
    const css = generateTestCSS(testCase.rules);
    const cssSize = (css.length / 1024).toFixed(2);

    console.log(`\n📄 测试场景: ${testCase.name}`);
    console.log(`   规则数量: ${testCase.rules} 条`);
    console.log(`   文件大小: ${cssSize} KB`);
    console.log(`   迭代次数: ${testCase.iterations} 次`);
    console.log('-'.repeat(80));

    // PostCSS 版本测试
    const postcssTime = await testPostCSS(css, testCase.iterations);
    const postcssAvg = (postcssTime / testCase.iterations).toFixed(2);
    console.log(`   PostCSS 版本:      总计 ${postcssTime}ms, 平均 ${postcssAvg}ms/次`);

    // Vite Plugin 版本测试
    const vitePluginTime = testVitePlugin(css, testCase.iterations);
    const vitePluginAvg = (vitePluginTime / testCase.iterations).toFixed(2);
    console.log(`   Vite Plugin 版本:  总计 ${vitePluginTime}ms, 平均 ${vitePluginAvg}ms/次`);

    // 计算性能提升
    const improvement = (((postcssTime - vitePluginTime) / postcssTime) * 100).toFixed(2);
    const speedup = (postcssTime / vitePluginTime).toFixed(2);

    if (vitePluginTime < postcssTime) {
      console.log(`   ✅ 性能提升: ${improvement}% (${speedup}x 倍速)`);
    } else {
      console.log(`   ⚠️  性能下降: ${Math.abs(improvement)}%`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('📊 总结:');
  console.log('   Vite Plugin 版本通过直接字符串处理，避免了 PostCSS 的 AST 解析开销');
  console.log('   在大型项目中，性能提升尤为明显');
  console.log('   建议纯 Vite 项目使用 Vite Plugin 版本以获得最佳性能');
  console.log('='.repeat(80));
}

// 内存占用测试
async function testMemoryUsage() {
  console.log('\n💾 内存占用测试\n');
  console.log('='.repeat(80));

  const css = generateTestCSS(5000);
  const iterations = 10;

  // 强制垃圾回收（如果可用）
  if (global.gc) {
    global.gc();
  }

  // PostCSS 版本
  const memBefore1 = process.memoryUsage().heapUsed / 1024 / 1024;
  await testPostCSS(css, iterations);
  const memAfter1 = process.memoryUsage().heapUsed / 1024 / 1024;
  const memUsedPostCSS = (memAfter1 - memBefore1).toFixed(2);

  console.log(`PostCSS 版本内存增长:      ${memUsedPostCSS} MB`);

  // 强制垃圾回收
  if (global.gc) {
    global.gc();
  }

  // Vite Plugin 版本
  const memBefore2 = process.memoryUsage().heapUsed / 1024 / 1024;
  testVitePlugin(css, iterations);
  const memAfter2 = process.memoryUsage().heapUsed / 1024 / 1024;
  const memUsedVitePlugin = (memAfter2 - memBefore2).toFixed(2);

  console.log(`Vite Plugin 版本内存增长:  ${memUsedVitePlugin} MB`);

  const memImprovement = (((memUsedPostCSS - memUsedVitePlugin) / memUsedPostCSS) * 100).toFixed(2);
  if (memUsedVitePlugin < memUsedPostCSS) {
    console.log(`✅ 内存节省: ${memImprovement}%`);
  }

  console.log('='.repeat(80));
}

// 功能正确性测试
async function testCorrectness() {
  console.log('\n✅ 功能正确性验证\n');
  console.log('='.repeat(80));

  const testCases = [
    {
      name: '基础 vpx',
      input: '.test { width: 100vpx; }',
      expected: '.test { width: 26.66667vw; }',
    },
    {
      name: 'maxvpx',
      input: '.test { width: 100maxvpx; }',
      expected: '.test { width: max(26.66667vw, 100px); }',
    },
    {
      name: 'minvpx',
      input: '.test { width: 100minvpx; }',
      expected: '.test { width: min(26.66667vw, 100px); }',
    },
    {
      name: 'cvpx',
      input: '.test { width: 100cvpx; }',
      expected: '.test { width: clamp(100px, 26.66667vw, 100px); }',
    },
    {
      name: '混合使用',
      input: '.test { width: 100vpx; height: 50maxvpx; margin: 20minvpx; }',
      expected:
        '.test { width: 26.66667vw; height: max(13.33333vw, 50px); margin: min(5.33333vw, 20px); }',
    },
  ];

  const config = {
    viewportWidth: 375,
    unitPrecision: 5,
    logConversions: false,
  };

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    // PostCSS 版本
    const postcssResult = await postcss([vpxToVwPostCSS(config)]).process(testCase.input, {
      from: undefined,
    });

    // Vite Plugin 版本
    const vitePlugin = vitePluginVpx(config);
    const viteResult = vitePlugin.transform(testCase.input, 'test.css');

    const postcssOutput = postcssResult.css;
    const viteOutput = viteResult?.code || testCase.input;

    const isMatch = postcssOutput === viteOutput && postcssOutput === testCase.expected;

    if (isMatch) {
      console.log(`✅ ${testCase.name}: 通过`);
      passed++;
    } else {
      console.log(`❌ ${testCase.name}: 失败`);
      console.log(`   期望: ${testCase.expected}`);
      console.log(`   PostCSS: ${postcssOutput}`);
      console.log(`   Vite Plugin: ${viteOutput}`);
      failed++;
    }
  }

  console.log('-'.repeat(80));
  console.log(`测试结果: ${passed} 通过, ${failed} 失败`);
  console.log('='.repeat(80));

  return failed === 0;
}

// 主函数
async function main() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                    VPX to Viewport - Performance Benchmark                   ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════════╝');

  // 功能正确性测试
  const correctnessPass = await testCorrectness();

  if (!correctnessPass) {
    console.log('\n⚠️  功能正确性测试未通过，跳过性能测试');
    return;
  }

  // 性能测试
  await runBenchmark();

  // 内存测试（需要使用 --expose-gc 标志运行）
  if (global.gc) {
    await testMemoryUsage();
  } else {
    console.log('\n💡 提示: 使用 `node --expose-gc vite-plugin-benchmark.js` 运行内存测试');
  }

  console.log('\n✨ 测试完成!\n');
}

// 运行测试
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  generateTestCSS,
  testPostCSS,
  testVitePlugin,
  runBenchmark,
  testCorrectness,
};
