/**
 * Vite Plugin 独立版：将 vpx 单位转换为 vw
 * 不依赖 PostCSS，直接处理 CSS 字符串，性能更好
 *
 * @param {Object} options 配置选项
 * @param {number} options.viewportWidth 视口宽度，默认 375
 * @param {number} options.unitPrecision 精度，默认 5
 * @param {Array} options.selectorBlackList 选择器黑名单
 * @param {Array} options.variableBlackList CSS变量黑名单
 * @param {number} options.minPixelValue 最小转换值，默认 1
 * @param {number} options.maxRatio maxvpx 的像素值倍数，默认 1
 * @param {number} options.minRatio minvpx 的像素值倍数，默认 1
 * @param {number} options.clampMinRatio cvpx 的最小值倍数，默认使用 minRatio
 * @param {number} options.clampMaxRatio cvpx 的最大值倍数，默认使用 maxRatio
 * @param {number} options.linearMinWidth 线性插值的最小视口宽度，默认 1200
 * @param {number} options.linearMaxWidth 线性插值的最大视口宽度，默认 1920
 * @param {boolean} options.autoClampLinear 是否自动为 linear-vpx 添加 clamp 限制，默认 true
 * @param {boolean} options.logConversions 是否记录转换日志，默认 false
 * @param {string} options.logLevel 日志级别，'silent', 'info', 'verbose'，默认 'info'
 * @param {Object} options.mediaQueries 媒体查询特定配置
 * @param {Array<string|RegExp>} options.include 包含的文件模式，默认 [/\.css$/, /\.scss$/, /\.sass$/, /\.less$/, /\.styl$/]
 * @param {Array<string|RegExp>} options.exclude 排除的文件模式，默认 [/node_modules/]
 */

const { createVpxTransformer } = require('./vpx-core');

function vitePluginVpx(options = {}) {
  const defaultConfig = {
    include: [/\.css$/, /\.scss$/, /\.sass$/, /\.less$/, /\.styl$/, /\.vue$/, /\.jsx$/, /\.tsx$/],
    exclude: [/node_modules/],
  };

  const opts = { ...defaultConfig, ...options };

  /**
   * 检查文件是否应该被处理
   */
  const shouldTransform = id => {
    if (!id) return false;

    // 检查排除规则
    if (
      opts.exclude.some(pattern => {
        if (typeof pattern === 'string') return id.includes(pattern);
        return pattern.test(id);
      })
    ) {
      return false;
    }

    // 检查包含规则
    return opts.include.some(pattern => {
      if (typeof pattern === 'string') return id.includes(pattern);
      return pattern.test(id);
    });
  };

  // Vite Plugin 接口
  return {
    name: 'vite-plugin-vpx',
    enforce: 'pre', // 在其他插件之前执行

    transform(code, id) {
      // 检查是否应该处理该文件
      if (!shouldTransform(id)) {
        return null;
      }

      // 只处理包含 vpx 的代码
      if (!code.includes('vpx')) {
        return null;
      }

      // 创建转换器（使用共享的核心模块）
      const transformer = createVpxTransformer(opts);

      // 执行转换
      const result = transformer.transform(code, id);

      // 输出日志
      const conversions = transformer.getConversions();
      if (opts.logConversions && conversions.length > 0 && opts.logLevel !== 'silent') {
        if (opts.logLevel === 'verbose') {
          console.log(`\n[vite-plugin-vpx] ${id}:`);
          conversions.forEach(conv => {
            console.log(`  ${conv.selector || conv.type}: ${conv.original} -> ${conv.converted}`);
          });
        } else if (opts.logLevel === 'info') {
          console.log(`[vite-plugin-vpx] ${id}: 转换了 ${conversions.length} 个 vpx 单位`);
        }
      }

      return {
        code: result,
        map: null, // 可以集成 magic-string 生成 source map
      };
    },
  };
}

// CommonJS 导出
module.exports = vitePluginVpx;
// ES Module 导出 (供 Vite 使用)
module.exports.default = vitePluginVpx;
