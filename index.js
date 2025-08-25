/**
 * PostCSS 插件：将 vpx 单位转换为 vw
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
 * @param {boolean} options.logConversions 是否记录转换日志，默认 false
 * @param {string} options.logLevel 日志级别，'silent', 'info', 'verbose'，默认 'info'
 * @param {Object} options.mediaQueries 媒体查询特定配置
 */
function vpxToVw(options = {}) {
  const defaultConfig = {
    viewportWidth: 375,
    unitPrecision: 5,
    selectorBlackList: [],
    variableBlackList: [],
    minPixelValue: 1,
    pluginId: 'default',
    maxRatio: 1,
    minRatio: 1,
    clampMinRatio: null,
    clampMaxRatio: null,
    logConversions: false,
    logLevel: 'info',
    mediaQueries: {},
  };

  const opts = Object.assign(defaultConfig, options);

  // 如果没有显式设置 clampMinRatio 和 clampMaxRatio，则使用 minRatio 和 maxRatio
  if (opts.clampMinRatio === null) {
    opts.clampMinRatio = opts.minRatio;
  }
  if (opts.clampMaxRatio === null) {
    opts.clampMaxRatio = opts.maxRatio;
  }

  // 处理媒体查询配置的 clamp 默认值
  Object.keys(opts.mediaQueries).forEach(mediaQuery => {
    const mqConfig = opts.mediaQueries[mediaQuery];
    if (mqConfig.clampMinRatio === null || mqConfig.clampMinRatio === undefined) {
      mqConfig.clampMinRatio = mqConfig.minRatio || opts.minRatio;
    }
    if (mqConfig.clampMaxRatio === null || mqConfig.clampMaxRatio === undefined) {
      mqConfig.clampMaxRatio = mqConfig.maxRatio || opts.maxRatio;
    }
  });

  const conversions = []; // 记录转换信息

  // 获取当前声明所在的媒体查询配置
  const getEffectiveConfig = (decl) => {
    let current = decl.parent;

    // 向上遍历查找媒体查询规则
    while (current) {
      if (current.type === 'atrule' && current.name === 'media') {
        const mediaQuery = `@media ${current.params}`;

        // 检查是否有匹配的媒体查询配置
        for (const [configuredQuery, config] of Object.entries(opts.mediaQueries)) {
          // 支持精确匹配和模糊匹配
          if (mediaQuery === configuredQuery ||
              mediaQuery.includes(configuredQuery.replace('@media ', '')) ||
              configuredQuery.includes(current.params)) {

            // 合并默认配置和媒体查询特定配置
            return Object.assign({}, opts, config, {
              _matchedMediaQuery: mediaQuery,
              _configuredQuery: configuredQuery,
            });
          }
        }
        break;
      }
      current = current.parent;
    }

    // 没有找到匹配的媒体查询，返回默认配置
    return opts;
  };

  return {
    postcssPlugin: `postcss-vpx-to-vw-${opts.pluginId}`,
    Declaration(decl) {
      // 检查声明值是否包含 vpx、maxvpx、minvpx 或 cvpx 单位
      if (decl.value.indexOf('vpx') === -1) return;

      // 获取当前有效配置（可能是媒体查询特定的配置）
      const effectiveConfig = getEffectiveConfig(decl);

      // 对于CSS变量，优先使用variableBlackList进行判断
      if (decl.prop.startsWith('--')) {
        if (effectiveConfig.variableBlackList.length > 0) {
          const isMatched = effectiveConfig.variableBlackList.some(blackVariable => {
            if (typeof blackVariable === 'string') {
              return decl.prop.indexOf(blackVariable) !== -1;
            }
            return decl.prop.match(blackVariable);
          });

          // 如果变量匹配黑名单，则跳过转换
          if (isMatched) {
            return;
          }
        }
      } else {
        // 对于非CSS变量，检查选择器是否在黑名单中
        const selector = decl.parent && decl.parent.selector;
        if (selector && effectiveConfig.selectorBlackList.length > 0) {
          const isMatched = effectiveConfig.selectorBlackList.some(blackSelector => {
            if (typeof blackSelector === 'string') {
              return selector.indexOf(blackSelector) !== -1;
            }
            return selector.match(blackSelector);
          });

          if (isMatched) {
            return;
          }
        }
      }

      // 通用转换函数
      const convertVpxUnit = (pixels, unitType) => {
        if (isNaN(pixels)) return null;

        // 如果绝对值小于或等于最小转换值，则转换为px
        if (Math.abs(pixels) <= effectiveConfig.minPixelValue) {
          return `${pixels}px`;
        }

        // 计算 vw 值
        const vwValue = (pixels / effectiveConfig.viewportWidth) * 100;
        const vwFormatted = parseFloat(vwValue.toFixed(effectiveConfig.unitPrecision));

        // 根据单位类型返回不同格式
        switch (unitType) {
        case 'maxvpx': {
          const maxPixels = parseFloat((pixels * effectiveConfig.maxRatio).toFixed(effectiveConfig.unitPrecision));
          // 对于负数，交换语义：maxvpx 变成 min() 以保持边界含义的一致性
          if (pixels < 0) {
            return `min(${vwFormatted}vw, ${maxPixels}px)`;
          } else {
            return `max(${vwFormatted}vw, ${maxPixels}px)`;
          }
        }
        case 'minvpx': {
          const minPixels = parseFloat((pixels * effectiveConfig.minRatio).toFixed(effectiveConfig.unitPrecision));
          // 对于负数，交换语义：minvpx 变成 max() 以保持边界含义的一致性
          if (pixels < 0) {
            return `max(${vwFormatted}vw, ${minPixels}px)`;
          } else {
            return `min(${vwFormatted}vw, ${minPixels}px)`;
          }
        }
        case 'cvpx': {
          const minPixels = parseFloat((pixels * effectiveConfig.clampMinRatio).toFixed(effectiveConfig.unitPrecision));
          const maxPixels = parseFloat((pixels * effectiveConfig.clampMaxRatio).toFixed(effectiveConfig.unitPrecision));

          // 对于负数，需要交换最小值和最大值的位置
          if (pixels < 0) {
            return `clamp(${maxPixels}px, ${vwFormatted}vw, ${minPixels}px)`;
          } else {
            return `clamp(${minPixels}px, ${vwFormatted}vw, ${maxPixels}px)`;
          }
        }
        case 'vpx':
          return `${vwFormatted}vw`;
        default:
          return `${vwFormatted}vw`;
        }
      };

      // 转换 vpx、maxvpx、minvpx 和 cvpx 单位
      let value = decl.value;

      // 统一处理所有 vpx 相关单位，支持负数
      value = value.replace(/(-?\d*\.?\d+)(max|min|c)?vpx/gi, (match, num, prefix) => {
        const pixels = parseFloat(num);
        const unitType = prefix ? `${prefix}vpx` : 'vpx';
        const converted = convertVpxUnit(pixels, unitType);
        return converted || match;
      });

      // 更新声明值
      if (value !== decl.value) {
        // 记录转换信息
        if (effectiveConfig.logConversions) {
          conversions.push({
            file: decl.source?.input?.from || 'unknown',
            selector: decl.parent?.selector || 'unknown',
            property: decl.prop,
            original: decl.value,
            converted: value,
            line: decl.source?.start?.line || 0,
            column: decl.source?.start?.column || 0,
            mediaQuery: effectiveConfig._matchedMediaQuery || 'default',
            configuredQuery: effectiveConfig._configuredQuery || 'default',
            viewportWidth: effectiveConfig.viewportWidth,
          });
        }

        decl.value = value;
      }
    },
    OnceExit() {
      // 输出转换日志
      if (opts.logConversions && conversions.length > 0 && opts.logLevel !== 'silent') {
        console.log(`\n[postcss-vpx-to-vw] 转换了 ${conversions.length} 个 vpx 单位:`);

        if (opts.logLevel === 'verbose') {
          conversions.forEach(conv => {
            const mediaInfo = conv.mediaQuery !== 'default' ? ` [${conv.mediaQuery}, vw:${conv.viewportWidth}]` : '';
            console.log(`  ${conv.file}:${conv.line}:${conv.column} ${conv.selector} { ${conv.property}: ${conv.original} -> ${conv.converted} }${mediaInfo}`);
          });
        } else if (opts.logLevel === 'info') {
          const fileStats = conversions.reduce((stats, conv) => {
            const key = `${conv.file}${conv.mediaQuery !== 'default' ? ` (${conv.mediaQuery})` : ''}`;
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
