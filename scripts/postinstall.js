#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 获取项目根目录（安装此包的项目）
const projectRoot = path.resolve(process.cwd(), '../..');
const vscodeDir = path.join(projectRoot, '.vscode');
const settingsFile = path.join(vscodeDir, 'settings.json');
const cssDataPath = './node_modules/postcss-vpx-to-vw/css-data.json';

// 检查是否在 node_modules 中（避免在开发时运行）
const isInNodeModules = __dirname.includes('node_modules');
if (!isInNodeModules) {
  console.log('⏭️  跳过自动配置（开发模式）');
  process.exit(0);
}

console.log('\n🎨 PostCSS VPX to VW - 配置 CSS 智能提示...\n');

try {
  // 创建 .vscode 目录（如果不存在）
  if (!fs.existsSync(vscodeDir)) {
    fs.mkdirSync(vscodeDir, { recursive: true });
    console.log('✅ 创建 .vscode 目录');
  }

  let settings = {};
  let needUpdate = false;

  // 读取现有配置
  if (fs.existsSync(settingsFile)) {
    try {
      const content = fs.readFileSync(settingsFile, 'utf8');
      settings = JSON.parse(content);
      console.log('📖 读取现有 VS Code 配置');
    } catch (e) {
      console.log('⚠️  无法解析现有配置文件，将创建新配置');
      settings = {};
    }
  }

  // 检查并添加 css.customData 配置
  if (!settings['css.customData']) {
    settings['css.customData'] = [cssDataPath];
    needUpdate = true;
  } else if (Array.isArray(settings['css.customData'])) {
    if (!settings['css.customData'].includes(cssDataPath)) {
      settings['css.customData'].push(cssDataPath);
      needUpdate = true;
    } else {
      console.log('ℹ️  CSS 智能提示已配置，无需更新');
    }
  }

  // 写入配置
  if (needUpdate) {
    fs.writeFileSync(
      settingsFile,
      JSON.stringify(settings, null, 2) + '\n',
      'utf8'
    );
    console.log('✅ 已自动配置 CSS 智能提示');
    console.log(`   配置文件: ${path.relative(projectRoot, settingsFile)}`);
  }

  console.log('\n💡 提示：');
  console.log('   - 重启 VS Code 以使配置生效');
  console.log('   - 编写 CSS 时输入 "vpx" 即可看到智能提示');
  console.log('   - 查看完整文档: node_modules/postcss-vpx-to-vw/CSS_INTELLISENSE.md\n');

} catch (error) {
  console.error('❌ 自动配置失败:', error.message);
  console.log('\n📝 手动配置方法：');
  console.log('   在项目根目录的 .vscode/settings.json 中添加：');
  console.log('   {');
  console.log('     "css.customData": ["./node_modules/postcss-vpx-to-vw/css-data.json"]');
  console.log('   }\n');
  process.exit(0); // 不阻断安装流程
}
