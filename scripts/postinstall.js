#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 获取项目根目录（安装此包的项目）
const projectRoot = path.resolve(process.cwd(), '../..');
const vscodeDir = path.join(projectRoot, '.vscode');
const settingsFile = path.join(vscodeDir, 'settings.json');
const snippetsFile = path.join(vscodeDir, 'css.json');
const cssDataPath = './node_modules/postcss-vpx-to-vw/css-data.json';
const snippetsSourcePath = path.join(__dirname, '../css-snippets.json');

// 检查是否在 node_modules 中（避免在开发时运行）
const isInNodeModules = __dirname.includes('node_modules');
if (!isInNodeModules) {
  console.log('⏭️  跳过自动配置（开发模式）');
  process.exit(0);
}

console.log('\n🎨 PostCSS VPX to VW - 配置 VS Code...\n');

try {
  // 创建 .vscode 目录（如果不存在）
  if (!fs.existsSync(vscodeDir)) {
    fs.mkdirSync(vscodeDir, { recursive: true });
    console.log('✅ 创建 .vscode 目录');
  }

  // 1. 配置 settings.json
  let settings = {};
  let needUpdateSettings = false;

  if (fs.existsSync(settingsFile)) {
    try {
      const content = fs.readFileSync(settingsFile, 'utf8');
      settings = JSON.parse(content);
    } catch (e) {
      settings = {};
    }
  }

  if (!settings['css.customData']) {
    settings['css.customData'] = [cssDataPath];
    needUpdateSettings = true;
  } else if (Array.isArray(settings['css.customData']) && !settings['css.customData'].includes(cssDataPath)) {
    settings['css.customData'].push(cssDataPath);
    needUpdateSettings = true;
  }

  if (!settings['css.lint.unknownProperties']) {
    settings['css.lint.unknownProperties'] = 'ignore';
    needUpdateSettings = true;
  }

  if (needUpdateSettings) {
    fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2) + '\n', 'utf8');
    console.log('✅ 已配置 CSS settings');
  }

  // 2. 配置代码片段
  if (fs.existsSync(snippetsSourcePath)) {
    let snippets = {};
    if (fs.existsSync(snippetsFile)) {
      try {
        snippets = JSON.parse(fs.readFileSync(snippetsFile, 'utf8'));
      } catch (e) {}
    }
    const newSnippets = JSON.parse(fs.readFileSync(snippetsSourcePath, 'utf8'));
    const merged = { ...snippets, ...newSnippets };
    fs.writeFileSync(snippetsFile, JSON.stringify(merged, null, 2) + '\n', 'utf8');
    console.log('✅ 已配置 CSS 代码片段');
  }

  console.log('\n💡 使用方法：');
  console.log('   1. 重启 VS Code（Cmd/Ctrl + Shift + P → "Reload Window"）');
  console.log('   2. 在 CSS 文件中输入前缀触发代码片段：');
  console.log('      - vpx, maxvpx, minvpx, cvpx');
  console.log('      - linear-vpx');
  console.log('\n');

} catch (error) {
  console.error('❌ 自动配置失败:', error.message);
  process.exit(0);
}
