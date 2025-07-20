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
 * @param {boolean} options.logConversions 是否记录转换日志，默认 false
 * @param {string} options.logLevel 日志级别，'silent', 'info', 'verbose'，默认 'info'
 */
function vpxToVw(options = {}) {
  const opts = Object.assign(
    {
      viewportWidth: 375,
      unitPrecision: 5,
      selectorBlackList: [],
      variableBlackList: [],
      minPixelValue: 1,
      pluginId: 'default',
      maxRatio: 1,
      minRatio: 1,
      logConversions: false,
      logLevel: 'info',
    },
    options
  );

  const conversions = []; // 记录转换信息

  return {
    postcssPlugin: `postcss-vpx-to-vw-${opts.pluginId}`,
    Declaration(decl) {
      // 检查声明值是否包含 vpx、maxvpx 或 minvpx 单位
      if (decl.value.indexOf('vpx') === -1) return;

      // 对于CSS变量，优先使用variableBlackList进行判断
      if (decl.prop.startsWith('--')) {
        if (opts.variableBlackList.length > 0) {
          const isMatched = opts.variableBlackList.some(blackVariable => {
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
        if (selector && opts.selectorBlackList.length > 0) {
          const isMatched = opts.selectorBlackList.some(blackSelector => {
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
        if (Math.abs(pixels) <= opts.minPixelValue) {
          return `${pixels}px`;
        }

        // 计算 vw 值
        const vwValue = (pixels / opts.viewportWidth) * 100;
        const vwFormatted = parseFloat(vwValue.toFixed(opts.unitPrecision));

        // 根据单位类型返回不同格式
        switch (unitType) {
          case 'maxvpx': {
            const maxPixels = parseFloat((pixels * opts.maxRatio).toFixed(opts.unitPrecision));
            return `max(${vwFormatted}vw, ${maxPixels}px)`;
          }
          case 'minvpx': {
            const minPixels = parseFloat((pixels * opts.minRatio).toFixed(opts.unitPrecision));
            return `min(${vwFormatted}vw, ${minPixels}px)`;
          }
          case 'vpx':
            return `${vwFormatted}vw`;
          default:
            return `${vwFormatted}vw`;
        }
      };

      // 转换 vpx、maxvpx 和 minvpx 单位
      let value = decl.value;

      // 统一处理所有 vpx 相关单位，支持负数
      value = value.replace(/(-?\d*\.?\d+)(max|min)?vpx/gi, (match, num, prefix) => {
        const pixels = parseFloat(num);
        const unitType = prefix ? `${prefix}vpx` : 'vpx';
        const converted = convertVpxUnit(pixels, unitType);
        return converted || match;
      });

      // 更新声明值
      if (value !== decl.value) {
        // 记录转换信息
        if (opts.logConversions) {
          conversions.push({
            file: decl.source?.input?.from || 'unknown',
            selector: decl.parent?.selector || 'unknown',
            property: decl.prop,
            original: decl.value,
            converted: value,
            line: decl.source?.start?.line || 0,
            column: decl.source?.start?.column || 0
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
            console.log(`  ${conv.file}:${conv.line}:${conv.column} ${conv.selector} { ${conv.property}: ${conv.original} -> ${conv.converted} }`);
          });
        } else if (opts.logLevel === 'info') {
          const fileStats = conversions.reduce((stats, conv) => {
            stats[conv.file] = (stats[conv.file] || 0) + 1;
            return stats;
          }, {});

          Object.entries(fileStats).forEach(([file, count]) => {
            console.log(`  ${file}: ${count} 个转换`);
          });
        }
      }
    }
  };
}

// 确保插件正确标识为 PostCSS 插件
vpxToVw.postcss = true;

module.exports = vpxToVw;
