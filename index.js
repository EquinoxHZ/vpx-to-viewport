/**
 * PostCSS 插件：将 vpx 单位转换为 vw
 * 使用共享的核心转换逻辑
 *
 * @param {Object} options 配置选项
 * @param {number} options.viewportWidth 视口宽度，默认 375
 * @param {number} options.unitPrecision 精度，默认 5
 * @param {Array} options.selectorBlackList 选择器黑名单
 * @param {Array} options.variableBlackList CSS变量黑名单
 * @param {number} options.minPixelValue 最小转换值，默认 1，小于此值的 vpx 会转换为 px
 * @param {string} options.pluginId 插件标识符，用于区分多个实例
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
 */

const { createVpxTransformer } = require('./vpx-core');

function vpxToVw(options = {}) {
  const defaultConfig = {
    pluginId: 'default',
  };

  const opts = Object.assign(defaultConfig, options);

  // 创建转换器（使用共享的核心模块）
  const transformer = createVpxTransformer(opts);
  const conversions = []; // 记录转换信息

  // 获取工具函数
  const utils = transformer.utils;

  // 获取基础配置（包含所有默认值和用户配置）
  const baseConfig = {
    viewportWidth: opts.viewportWidth !== undefined ? opts.viewportWidth : 375,
    unitPrecision: opts.unitPrecision !== undefined ? opts.unitPrecision : 5,
    selectorBlackList: opts.selectorBlackList || [],
    variableBlackList: opts.variableBlackList || [],
    minPixelValue: opts.minPixelValue !== undefined ? opts.minPixelValue : 1,
    maxRatio: opts.maxRatio !== undefined ? opts.maxRatio : 1,
    minRatio: opts.minRatio !== undefined ? opts.minRatio : 1,
    clampMinRatio: opts.clampMinRatio !== null && opts.clampMinRatio !== undefined ? opts.clampMinRatio : (opts.minRatio !== undefined ? opts.minRatio : 1),
    clampMaxRatio: opts.clampMaxRatio !== null && opts.clampMaxRatio !== undefined ? opts.clampMaxRatio : (opts.maxRatio !== undefined ? opts.maxRatio : 1),
    linearMinWidth: opts.linearMinWidth !== undefined ? opts.linearMinWidth : 1200,
    linearMaxWidth: opts.linearMaxWidth !== undefined ? opts.linearMaxWidth : 1920,
    autoClampLinear: opts.autoClampLinear !== undefined ? opts.autoClampLinear : true,
    logConversions: opts.logConversions !== undefined ? opts.logConversions : false,
    logLevel: opts.logLevel || 'info',
    mediaQueries: opts.mediaQueries || {},
  };

  /**
   * 获取当前声明所在的媒体查询配置
   * 优先级：精确匹配 > 子集匹配 > 默认配置
   */
  const getEffectiveConfig = (decl, baseConfig) => {
    let current = decl.parent;

    // 向上遍历查找媒体查询规则
    while (current) {
      if (current.type === 'atrule' && current.name === 'media') {
        const actualParams = current.params;
        const mqStr = `@media ${actualParams.trim()}`;

        // 使用核心模块的配置获取函数
        return utils.getMediaQueryConfig(mqStr);
      }
      current = current.parent;
    }

    // 没有找到匹配的媒体查询，返回基础配置
    return baseConfig;
  };

  return {
    postcssPlugin: `postcss-vpx-to-vw-${opts.pluginId}`,
    Declaration(decl) {
      // 检查声明值是否包含 vpx、maxvpx、minvpx、cvpx 单位或 linear-vpx 函数
      if (decl.value.indexOf('vpx') === -1) return;

      // 获取当前有效配置（可能是媒体查询特定的配置）
      const effectiveConfig = getEffectiveConfig(decl, baseConfig);

      // 检查黑名单（对所有 vpx 相关功能统一处理）
      // 对于CSS变量，优先使用variableBlackList进行判断
      if (decl.prop.startsWith('--')) {
        if (utils.isVariableBlacklisted(decl.prop, effectiveConfig)) {
          return;
        }
      } else {
        // 对于非CSS变量，检查选择器是否在黑名单中
        const selector = decl.parent && decl.parent.selector;
        if (selector && utils.isSelectorBlacklisted(selector, effectiveConfig)) {
          return;
        }
      }

      const originalValue = decl.value;
      const filename = decl.source?.input?.from || 'unknown';
      const selector = decl.parent?.selector || 'unknown';

      // 先处理 linear-vpx 函数
      if (decl.value.indexOf('linear-vpx') !== -1) {
        decl.value = utils.convertLinearVpx(decl.value, effectiveConfig, filename);

        // 如果转换后不再包含 vpx，记录日志并返回
        if (decl.value.indexOf('vpx') === -1) {
          if (decl.value !== originalValue && effectiveConfig.logConversions) {
            conversions.push({
              file: filename,
              selector,
              property: decl.prop,
              original: originalValue,
              converted: decl.value,
              line: decl.source?.start?.line || 0,
              column: decl.source?.start?.column || 0,
              mediaQuery: effectiveConfig._matchedMediaQuery || 'default',
              configuredQuery: effectiveConfig._configuredQuery || 'default',
              viewportWidth: effectiveConfig.viewportWidth,
            });
          }
          return;
        }
      }

      // 转换 vpx、maxvpx、minvpx 和 cvpx 单位
      decl.value = utils.convertVpxUnits(decl.value, effectiveConfig, filename, selector);

      // 更新声明值并记录日志
      if (decl.value !== originalValue) {
        if (effectiveConfig.logConversions) {
          conversions.push({
            file: filename,
            selector,
            property: decl.prop,
            original: originalValue,
            converted: decl.value,
            line: decl.source?.start?.line || 0,
            column: decl.source?.start?.column || 0,
            mediaQuery: effectiveConfig._matchedMediaQuery || 'default',
            configuredQuery: effectiveConfig._configuredQuery || 'default',
            viewportWidth: effectiveConfig.viewportWidth,
          });
        }
      }
    },
    OnceExit() {
      // 输出转换日志
      if (baseConfig.logConversions && conversions.length > 0 && baseConfig.logLevel !== 'silent') {
        console.log(`\n[postcss-vpx-to-vw] 转换了 ${conversions.length} 个 vpx 单位:`);

        if (baseConfig.logLevel === 'verbose') {
          conversions.forEach(conv => {
            const mediaInfo =
              conv.mediaQuery !== 'default'
                ? ` [${conv.mediaQuery}, vw:${conv.viewportWidth}]`
                : '';
            console.log(
              `  ${conv.file}:${conv.line}:${conv.column} ${conv.selector} { ${conv.property}: ${conv.original} -> ${conv.converted} }${mediaInfo}`,
            );
          });
        } else if (baseConfig.logLevel === 'info') {
          const fileStats = conversions.reduce((stats, conv) => {
            const key = `${conv.file}${
              conv.mediaQuery !== 'default' ? ` (${conv.mediaQuery})` : ''
            }`;
            stats[key] = (stats[key] || 0) + 1;
            return stats;
          }, {});

          Object.entries(fileStats).forEach(([file, count]) => {
            console.log(`  ${file}: ${count} 个转换`);
          });
        }
      }
    },
  };
}

// 确保插件正确标识为 PostCSS 插件
vpxToVw.postcss = true;

module.exports = vpxToVw;
