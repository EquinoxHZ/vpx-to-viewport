/**
 * PostCSS 插件：将 vpx 单位转换为 vw
 * @param {Object} options 配置选项
 * @param {number} options.viewportWidth 视口宽度，默认 375
 * @param {number} options.unitPrecision 精度，默认 5
 * @param {Array} options.selectorBlackList 选择器黑名单
 * @param {Array} options.variableBlackList CSS变量黑名单
 * @param {number} options.minPixelValue 最小转换值，默认 1，小于此值的 vpx 会转换为 px
 * @param {string} options.pluginId 插件标识符，用于区分多个实例
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
    },
    options
  );

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

        // 如果小于最小转换值，则转换为px
        if (pixels < opts.minPixelValue) {
          return `${pixels}px`;
        }

        // 计算 vw 值
        const vwValue = (pixels / opts.viewportWidth) * 100;
        const vwFormatted = parseFloat(vwValue.toFixed(opts.unitPrecision));

        // 根据单位类型返回不同格式
        switch (unitType) {
        case 'maxvpx':
          return `max(${vwFormatted}vw, ${pixels}px)`;
        case 'minvpx':
          return `min(${vwFormatted}vw, ${pixels}px)`;
        case 'vpx':
          return `${vwFormatted}vw`;
        default:
          return `${vwFormatted}vw`;
        }
      };

      // 转换 vpx、maxvpx 和 minvpx 单位
      let value = decl.value;

      // 统一处理所有 vpx 相关单位
      value = value.replace(/(\d*\.?\d+)(max|min)?vpx/gi, (match, num, prefix) => {
        const pixels = parseFloat(num);
        const unitType = prefix ? `${prefix}vpx` : 'vpx';
        const converted = convertVpxUnit(pixels, unitType);
        return converted || match;
      });

      // 更新声明值
      if (value !== decl.value) {
        decl.value = value;
      }
    },
  };
}

// 确保插件正确标识为 PostCSS 插件
vpxToVw.postcss = true;

module.exports = vpxToVw;
