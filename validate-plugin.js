// 简单的插件验证脚本
const vpxToVw = require('./index.js');

// 检查插件是否正确导出
console.log('Plugin function:', typeof vpxToVw);
console.log('Plugin postcss property:', vpxToVw.postcss);

// 测试插件实例化
try {
  const plugin = vpxToVw();
  console.log('Plugin instance:', typeof plugin);
  console.log('Plugin name:', plugin.postcssPlugin);
  console.log('Plugin has Declaration method:', typeof plugin.Declaration);
  console.log('✅ Plugin validation passed');
} catch (error) {
  console.error('❌ Plugin validation failed:', error.message);
  process.exit(1);
}
