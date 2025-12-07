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
 * @param {number} options.linearMinWidth 线性插值的最小视口宽度，默认 1200
 * @param {number} options.linearMaxWidth 线性插值的最大视口宽度，默认 1920
 * @param {boolean} options.autoClampLinear 是否自动为 linear-vpx 添加 clamp 限制，默认 true
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
    linearMinWidth: 1200,
    linearMaxWidth: 1920,
    autoClampLinear: true,
    logConversions: false,
    logLevel: 'info',
    mediaQueries: {},
  };

  const opts = Object.assign(defaultConfig, options);

  // ==================== 参数验证 ====================
  if (opts.viewportWidth <= 0) {
    throw new Error('[postcss-vpx-to-vw] viewportWidth 必须大于 0');
  }
  if (opts.unitPrecision < 0 || !Number.isInteger(opts.unitPrecision)) {
    throw new Error('[postcss-vpx-to-vw] unitPrecision 必须为非负整数');
  }
  if (opts.minPixelValue < 0) {
    throw new Error('[postcss-vpx-to-vw] minPixelValue 不能为负数');
  }
  if (opts.linearMinWidth >= opts.linearMaxWidth) {
    throw new Error('[postcss-vpx-to-vw] linearMinWidth 必须小于 linearMaxWidth');
  }
  if (!['silent', 'info', 'verbose'].includes(opts.logLevel)) {
    throw new Error(
      `[postcss-vpx-to-vw] 无效的 logLevel: ${opts.logLevel}，应为 'silent', 'info' 或 'verbose'`,
    );
  }

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

  // ==================== 辅助函数 ====================

  /**
   * 规范化媒体查询字符串（用于匹配比较）
   * @param {string} mediaQuery - 原始媒体查询字符串
   * @returns {string} 规范化后的媒体查询
   */
  const normalizeMediaQuery = mediaQuery => {
    return mediaQuery.replace('@media ', '').replace(/\s+/g, ' ').trim();
  };

  /**
   * 检查媒体查询是否匹配（支持精确匹配和子集匹配）
   * @param {string} actual - 实际的媒体查询参数
   * @param {string} configured - 配置的媒体查询
   * @returns {boolean}
   */
  const isMediaQueryMatched = (actual, configured) => {
    const actualNorm = normalizeMediaQuery(actual);
    const configuredNorm = normalizeMediaQuery(configured.replace('@media ', ''));

    // 精确匹配
    if (actualNorm === configuredNorm) return true;

    // 子集匹配：configured 是否是 actual 的一部分
    // 例如：configured="(min-width: 768px)" 匹配 actual="(min-width: 768px) and (max-width: 1200px)"
    return actualNorm.includes(configuredNorm);
  };

  /**
   * 获取当前声明所在的媒体查询配置
   * 优先级：精确匹配 > 子集匹配 > 默认配置
   */
  const getEffectiveConfig = decl => {
    let current = decl.parent;

    // 向上遍历查找媒体查询规则
    while (current) {
      if (current.type === 'atrule' && current.name === 'media') {
        const actualParams = current.params;

        // 查找匹配的媒体查询配置（优先级处理）
        let bestMatch = null;
        let bestMatchScore = -1; // -1: 无匹配, 0: 子集匹配, 1: 精确匹配

        for (const [configuredQuery, config] of Object.entries(opts.mediaQueries)) {
          if (isMediaQueryMatched(actualParams, configuredQuery)) {
            const isExactMatch =
              normalizeMediaQuery(actualParams) ===
              normalizeMediaQuery(configuredQuery.replace('@media ', ''));

            const score = isExactMatch ? 1 : 0;

            // 优先选择精确匹配，如果分数相同则保留第一个
            if (score > bestMatchScore) {
              bestMatchScore = score;
              bestMatch = {
                config,
                mediaQuery: `@media ${actualParams}`,
                configuredQuery,
              };
            }
          }
        }

        if (bestMatch) {
          return Object.assign({}, opts, bestMatch.config, {
            _matchedMediaQuery: bestMatch.mediaQuery,
            _configuredQuery: bestMatch.configuredQuery,
          });
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
      // 检查声明值是否包含 vpx、maxvpx、minvpx、cvpx 单位或 linear-vpx 函数
      if (decl.value.indexOf('vpx') === -1) return;

      // 获取当前有效配置（可能是媒体查询特定的配置）
      const effectiveConfig = getEffectiveConfig(decl);

      // 检查黑名单（对所有 vpx 相关功能统一处理）
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

      // 先处理 linear-vpx 函数
      if (decl.value.indexOf('linear-vpx') !== -1) {
        let value = decl.value;
        const originalValue = value;

        // 匹配 linear-vpx(minVal, maxVal, minWidth, maxWidth) 或 linear-vpx(minVal, maxVal)
        // 改进的正则：更严格的数值匹配
        value = value.replace(
          /linear-vpx\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*(?:,\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?))?\s*\)/gi,
          (match, minVal, maxVal, minWidth, maxWidth) => {
            const min = parseFloat(minVal);
            const max = parseFloat(maxVal);
            const minW = minWidth ? parseFloat(minWidth) : effectiveConfig.linearMinWidth;
            const maxW = maxWidth ? parseFloat(maxWidth) : effectiveConfig.linearMaxWidth;

            // 验证参数有效性
            if (isNaN(min) || isNaN(max) || isNaN(minW) || isNaN(maxW)) {
              return match; // 参数无效，保持原样
            }

            const widthDiff = maxW - minW;
            if (widthDiff === 0) {
              console.warn(
                '[postcss-vpx-to-vw] linear-vpx: linearMinWidth 和 linearMaxWidth 相同，跳过转换',
              );
              return match;
            }

            // 计算差值，使用统一的精度
            const valueDiff = parseFloat((max - min).toFixed(effectiveConfig.unitPrecision));
            const minFormatted = parseFloat(min.toFixed(effectiveConfig.unitPrecision));
            const maxFormatted = parseFloat(max.toFixed(effectiveConfig.unitPrecision));
            const minWFormatted = parseFloat(minW.toFixed(effectiveConfig.unitPrecision));

            // 生成 calc 表达式
            const calcExpr = `calc(${minFormatted}px + ${valueDiff} * (100vw - ${minWFormatted}px) / ${widthDiff})`;

            // 根据配置决定是否添加 clamp
            if (effectiveConfig.autoClampLinear) {
              return `clamp(${minFormatted}px, ${calcExpr}, ${maxFormatted}px)`;
            } else {
              return calcExpr;
            }
          },
        );

        // 如果发生了转换，记录日志并更新值
        if (value !== originalValue) {
          if (effectiveConfig.logConversions) {
            conversions.push({
              file: decl.source?.input?.from || 'unknown',
              selector: decl.parent?.selector || 'unknown',
              property: decl.prop,
              original: originalValue,
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

        // 如果转换后不再包含 vpx，直接返回
        if (decl.value.indexOf('vpx') === -1) return;
      }

      // 通用转换函数 - 核心逻辑重构
      const convertVpxUnit = (pixels, unitType) => {
        // 参数验证
        if (isNaN(pixels)) return null;
        if (!['vpx', 'maxvpx', 'minvpx', 'cvpx'].includes(unitType)) return null;

        // 如果绝对值小于或等于最小转换值，则转换为px
        if (Math.abs(pixels) <= effectiveConfig.minPixelValue) {
          return `${pixels}px`;
        }

        // 计算基础 vw 值
        const vwValue = (pixels / effectiveConfig.viewportWidth) * 100;
        const vwFormatted = parseFloat(vwValue.toFixed(effectiveConfig.unitPrecision));

        // 根据单位类型返回不同格式
        switch (unitType) {
          case 'maxvpx':
            return formatMaxVpx(pixels, vwFormatted);
          case 'minvpx':
            return formatMinVpx(pixels, vwFormatted);
          case 'cvpx':
            return formatClampVpx(pixels, vwFormatted);
          case 'vpx':
          default:
            return `${vwFormatted}vw`;
        }
      };

      /**
       * 格式化 maxvpx：表示"最小不低于某个像素值"的上限
       *
       * 设计理念：
       * - 正数情况：max(vw, Npx) - vw 较小时使用 Npx，保证最小值
       * - 负数情况：min(vw, Npx) - vw 较小（绝对值较大）时使用 Npx
       *
       * 例如 maxvpx 100 @375px：
       *   - 于375px视口：100px 不低于26.67vw ✓
       *   - 于750px视口：200px 不低于53.33vw ✓
       */
      const formatMaxVpx = (pixels, vwFormatted) => {
        const maxPixels = parseFloat(
          (pixels * effectiveConfig.maxRatio).toFixed(effectiveConfig.unitPrecision),
        );
        return pixels < 0
          ? `min(${vwFormatted}vw, ${maxPixels}px)`
          : `max(${vwFormatted}vw, ${maxPixels}px)`;
      };

      /**
       * 格式化 minvpx：表示"最大不超过某个像素值"的下限
       *
       * 设计理念：
       * - 正数情况：min(vw, Npx) - vw 较大时使用 Npx，保证最大值
       * - 负数情况：max(vw, Npx) - vw 较大（绝对值较小）时使用 Npx
       *
       * 例如 minvpx 100 @375px：
       *   - 于375px视口：100px 不超过26.67vw ✓
       *   - 于750px视口：200px 不超过53.33vw ✓
       */
      const formatMinVpx = (pixels, vwFormatted) => {
        const minPixels = parseFloat(
          (pixels * effectiveConfig.minRatio).toFixed(effectiveConfig.unitPrecision),
        );
        return pixels < 0
          ? `max(${vwFormatted}vw, ${minPixels}px)`
          : `min(${vwFormatted}vw, ${minPixels}px)`;
      };

      /**
       * 格式化 cvpx：表示"在某个范围内响应式缩放"
       *
       * 设计理念：
       * - 正数情况：clamp(minPx, vw, maxPx) - 值在 [minPx, maxPx] 范围内
       * - 负数情况：clamp(maxPx, vw, minPx) - 交换位置以适应负数语义
       *
       * 例如 cvpx 100 @375px, minRatio=0.5, maxRatio=2：
       *   - 最小值：100 * 0.5 = 50px
       *   - 最大值：100 * 2 = 200px
       *   - 响应式值：26.67vw
       *   - 结果：clamp(50px, 26.67vw, 200px)
       */
      const formatClampVpx = (pixels, vwFormatted) => {
        const minPixels = parseFloat(
          (pixels * effectiveConfig.clampMinRatio).toFixed(effectiveConfig.unitPrecision),
        );
        const maxPixels = parseFloat(
          (pixels * effectiveConfig.clampMaxRatio).toFixed(effectiveConfig.unitPrecision),
        );

        if (pixels < 0) {
          // 负数情况：交换最小值和最大值的位置
          return `clamp(${maxPixels}px, ${vwFormatted}vw, ${minPixels}px)`;
        } else {
          return `clamp(${minPixels}px, ${vwFormatted}vw, ${maxPixels}px)`;
        }
      };

      // 转换 vpx、maxvpx、minvpx 和 cvpx 单位
      let value = decl.value;

      // 改进的正则表达式：更严格的数值匹配
      // 只匹配有效的数值格式：整数或带小数点的小数
      value = value.replace(/(-?\d+(?:\.\d+)?)(max|min|c)?vpx/gi, (match, num, prefix) => {
        const pixels = parseFloat(num);

        // 验证提取的数值
        if (isNaN(pixels)) {
          return match;
        }

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
            const mediaInfo =
              conv.mediaQuery !== 'default'
                ? ` [${conv.mediaQuery}, vw:${conv.viewportWidth}]`
                : '';
            console.log(
              `  ${conv.file}:${conv.line}:${conv.column} ${conv.selector} { ${conv.property}: ${conv.original} -> ${conv.converted} }${mediaInfo}`,
            );
          });
        } else if (opts.logLevel === 'info') {
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
