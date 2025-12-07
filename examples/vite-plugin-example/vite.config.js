import { defineConfig } from 'vite';
import vitePluginVpx from '../../vite-plugin-vpx.js';

export default defineConfig({
  plugins: [
    vitePluginVpx({
      viewportWidth: 375,
      unitPrecision: 5,
      minPixelValue: 1,
      maxRatio: 1,
      minRatio: 1,
      logConversions: true,
      logLevel: 'info',
      
      // 媒体查询配置示例
      mediaQueries: {
        '@media (min-width: 768px)': {
          viewportWidth: 768,
          minRatio: 0.8,
          maxRatio: 1.5
        },
        '@media (min-width: 1920px)': {
          viewportWidth: 1920,
          linearMinWidth: 1920,
          linearMaxWidth: 2560
        }
      },
      
      // 黑名单示例
      selectorBlackList: ['.no-convert', /^\.ignore-/],
      variableBlackList: ['--raw-size'],
      
      // 文件过滤
      include: [/\.css$/, /\.scss$/],
      exclude: [/node_modules/]
    })
  ]
});
