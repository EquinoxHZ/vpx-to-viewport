const postcss = require('postcss');
const vpxToVw = require('../index');

// 示例 CSS
const css = `
.header {
  width: 100vpx;
  height: 50vpx;
  font-size: 16maxvpx;
  line-height: 24minvpx;
  margin: 10vpx 20vpx;
  padding: 8vpx;
}

.container {
  max-width: 1200minvpx;
  margin: 0 auto;
  padding: 20vpx;
}

:root {
  --primary-size: 36vpx;
  --secondary-size: 24maxvpx;
  --tertiary-size: 18minvpx;
}

.button {
  font-size: var(--primary-size);
  padding: 12vpx 24vpx;
  border-radius: 4vpx;
}
`;

console.log('=== 转换日志演示 ===\n');

// 演示不同日志级别
async function demonstrateLogLevels() {
  console.log('1. 静默模式 (silent):');
  console.log('---');
  await postcss([vpxToVw({ logConversions: true, logLevel: 'silent' })])
    .process(css, { from: 'demo.css' });
  console.log('(没有日志输出)\n');

  console.log('2. 信息模式 (info):');
  console.log('---');
  await postcss([vpxToVw({ logConversions: true, logLevel: 'info' })])
    .process(css, { from: 'demo.css' });
  console.log('');

  console.log('3. 详细模式 (verbose):');
  console.log('---');
  await postcss([vpxToVw({ logConversions: true, logLevel: 'verbose' })])
    .process(css, { from: 'demo.css' });
  console.log('');

  console.log('4. 关闭日志 (logConversions: false):');
  console.log('---');
  await postcss([vpxToVw({ logConversions: false })])
    .process(css, { from: 'demo.css' });
  console.log('(没有日志输出)\n');
}

demonstrateLogLevels().catch(console.error);
