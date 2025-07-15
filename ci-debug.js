#!/usr/bin/env node

// CI 环境调试脚本
console.log('=== CI Environment Debug ===');
console.log('Node version:', process.version);
console.log('Platform:', process.platform);
console.log('Current working directory:', process.cwd());

// 检查 PostCSS 依赖
console.log('\n=== PostCSS Check ===');
try {
  const postcss = require('postcss');
  console.log('PostCSS version:', postcss().version);
} catch (error) {
  console.error('❌ PostCSS not found:', error.message);
}

// 检查插件
console.log('\n=== Plugin Check ===');
try {
  const plugin = require('./index.js');
  console.log('Plugin type:', typeof plugin);
  console.log('Plugin postcss property:', plugin.postcss);

  const instance = plugin();
  console.log('Plugin instance:', typeof instance);
  console.log('Plugin name:', instance.postcssPlugin);
} catch (error) {
  console.error('❌ Plugin check failed:', error.message);
  console.error('Stack:', error.stack);
}

// 检查 PostCSS 集成
console.log('\n=== PostCSS Integration Check ===');
try {
  const postcss = require('postcss');
  const plugin = require('./index.js');

  const processor = postcss([plugin()]);
  const result = processor.process('.test { width: 100vpx; }', { from: undefined });
  console.log('✅ PostCSS integration works');
} catch (error) {
  console.error('❌ PostCSS integration failed:', error.message);
  console.error('Stack:', error.stack);
}

console.log('\n=== Debug Complete ===');
