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
function vitePluginVpx(options = {}) {
  const defaultConfig = {
    viewportWidth: 375,
    unitPrecision: 5,
    selectorBlackList: [],
    variableBlackList: [],
    minPixelValue: 1,
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
    include: [/\.css$/, /\.scss$/, /\.sass$/, /\.less$/, /\.styl$/, /\.vue$/, /\.jsx$/, /\.tsx$/],
    exclude: [/node_modules/],
  };

  const opts = { ...defaultConfig, ...options };

  // ==================== 参数验证 ====================
  if (opts.viewportWidth <= 0) {
    throw new Error('[vite-plugin-vpx] viewportWidth 必须大于 0');
  }
  if (opts.unitPrecision < 0 || !Number.isInteger(opts.unitPrecision)) {
    throw new Error('[vite-plugin-vpx] unitPrecision 必须为非负整数');
  }
  if (opts.minPixelValue < 0) {
    throw new Error('[vite-plugin-vpx] minPixelValue 不能为负数');
  }
  if (opts.linearMinWidth >= opts.linearMaxWidth) {
    throw new Error('[vite-plugin-vpx] linearMinWidth 必须小于 linearMaxWidth');
  }
  if (!['silent', 'info', 'verbose'].includes(opts.logLevel)) {
    throw new Error(
      `[vite-plugin-vpx] 无效的 logLevel: ${opts.logLevel}，应为 'silent', 'info' 或 'verbose'`,
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

  /**
   * 规范化媒体查询字符串（用于匹配比较）
   */
  const normalizeMediaQuery = mediaQuery => {
    return mediaQuery.replace('@media ', '').replace(/\s+/g, ' ').trim();
  };

  /**
   * 检查媒体查询是否匹配（支持精确匹配和子集匹配）
   */
  const isMediaQueryMatched = (actual, configured) => {
    const actualNorm = normalizeMediaQuery(actual);
    const configuredNorm = normalizeMediaQuery(configured.replace('@media ', ''));

    // 精确匹配
    if (actualNorm === configuredNorm) return true;

    // 子集匹配
    return actualNorm.includes(configuredNorm);
  };

  /**
   * 获取媒体查询对应的配置
   */
  const getMediaQueryConfig = mediaQueryStr => {
    if (!mediaQueryStr) return opts;

    let bestMatch = null;
    let bestMatchScore = -1;

    for (const [configuredQuery, config] of Object.entries(opts.mediaQueries)) {
      if (isMediaQueryMatched(mediaQueryStr, configuredQuery)) {
        const isExactMatch =
          normalizeMediaQuery(mediaQueryStr) ===
          normalizeMediaQuery(configuredQuery.replace('@media ', ''));
        const score = isExactMatch ? 1 : 0;

        if (score > bestMatchScore) {
          bestMatchScore = score;
          bestMatch = {
            config,
            mediaQuery: mediaQueryStr,
            configuredQuery,
          };
        }
      }
    }

    if (bestMatch) {
      return {
        ...opts,
        ...bestMatch.config,
        _matchedMediaQuery: bestMatch.mediaQuery,
        _configuredQuery: bestMatch.configuredQuery,
      };
    }

    return opts;
  };

  /**
   * 检查选择器是否在黑名单中
   */
  const isSelectorBlacklisted = (selector, config) => {
    if (!selector || config.selectorBlackList.length === 0) return false;

    return config.selectorBlackList.some(blackSelector => {
      if (typeof blackSelector === 'string') {
        return selector.indexOf(blackSelector) !== -1;
      }
      return blackSelector.test(selector);
    });
  };

  /**
   * 检查CSS变量是否在黑名单中
   */
  const isVariableBlacklisted = (variable, config) => {
    if (!variable || config.variableBlackList.length === 0) return false;

    return config.variableBlackList.some(blackVariable => {
      if (typeof blackVariable === 'string') {
        return variable.indexOf(blackVariable) !== -1;
      }
      return blackVariable.test(variable);
    });
  };

  /**
   * 转换 linear-vpx 函数
   */
  const convertLinearVpx = (code, config, filename) => {
    return code.replace(
      /linear-vpx\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*(?:,\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?))?\s*\)/gi,
      (match, minVal, maxVal, minWidth, maxWidth) => {
        const min = parseFloat(minVal);
        const max = parseFloat(maxVal);
        const minW = minWidth ? parseFloat(minWidth) : config.linearMinWidth;
        const maxW = maxWidth ? parseFloat(maxWidth) : config.linearMaxWidth;

        // 验证参数有效性
        if (isNaN(min) || isNaN(max) || isNaN(minW) || isNaN(maxW)) {
          return match;
        }

        const widthDiff = maxW - minW;
        if (widthDiff === 0) {
          console.warn(
            '[vite-plugin-vpx] linear-vpx: linearMinWidth 和 linearMaxWidth 相同，跳过转换',
          );
          return match;
        }

        // 计算差值
        const valueDiff = parseFloat((max - min).toFixed(config.unitPrecision));
        const minFormatted = parseFloat(min.toFixed(config.unitPrecision));
        const maxFormatted = parseFloat(max.toFixed(config.unitPrecision));
        const minWFormatted = parseFloat(minW.toFixed(config.unitPrecision));

        // 生成 calc 表达式
        const calcExpr = `calc(${minFormatted}px + ${valueDiff} * (100vw - ${minWFormatted}px) / ${widthDiff})`;

        // 根据配置决定是否添加 clamp
        const result = config.autoClampLinear
          ? `clamp(${minFormatted}px, ${calcExpr}, ${maxFormatted}px)`
          : calcExpr;

        if (config.logConversions) {
          conversions.push({
            file: filename,
            type: 'linear-vpx',
            original: match,
            converted: result,
          });
        }

        return result;
      },
    );
  };

  /**
   * 转换 vpx 单位（vpx, maxvpx, minvpx, cvpx）
   */
  const convertVpxUnits = (code, config, filename, selector = 'unknown') => {
    return code.replace(/(-?\d+(?:\.\d+)?)(max|min|c)?vpx/gi, (match, num, prefix) => {
      const pixels = parseFloat(num);

      // 验证提取的数值
      if (isNaN(pixels)) {
        return match;
      }

      // 如果绝对值小于或等于最小转换值，则转换为px
      if (Math.abs(pixels) <= config.minPixelValue) {
        return `${pixels}px`;
      }

      // 计算基础 vw 值
      const vwValue = (pixels / config.viewportWidth) * 100;
      const vwFormatted = parseFloat(vwValue.toFixed(config.unitPrecision));

      const unitType = prefix ? `${prefix}vpx` : 'vpx';
      let result;

      switch (unitType) {
        case 'maxvpx': {
          const maxPixels = parseFloat((pixels * config.maxRatio).toFixed(config.unitPrecision));
          result =
            pixels < 0
              ? `min(${vwFormatted}vw, ${maxPixels}px)`
              : `max(${vwFormatted}vw, ${maxPixels}px)`;
          break;
        }
        case 'minvpx': {
          const minPixels = parseFloat((pixels * config.minRatio).toFixed(config.unitPrecision));
          result =
            pixels < 0
              ? `max(${vwFormatted}vw, ${minPixels}px)`
              : `min(${vwFormatted}vw, ${minPixels}px)`;
          break;
        }
        case 'cvpx': {
          const minPixels = parseFloat(
            (pixels * config.clampMinRatio).toFixed(config.unitPrecision),
          );
          const maxPixels = parseFloat(
            (pixels * config.clampMaxRatio).toFixed(config.unitPrecision),
          );
          result =
            pixels < 0
              ? `clamp(${maxPixels}px, ${vwFormatted}vw, ${minPixels}px)`
              : `clamp(${minPixels}px, ${vwFormatted}vw, ${maxPixels}px)`;
          break;
        }
        case 'vpx':
        default:
          result = `${vwFormatted}vw`;
      }

      if (config.logConversions) {
        conversions.push({
          file: filename,
          selector,
          type: unitType,
          original: match,
          converted: result,
        });
      }

      return result;
    });
  };

  /**
   * 处理 CSS 规则块（包含选择器和声明）
   */
  const processRuleBlock = (code, config, filename) => {
    // 匹配 CSS 规则块：selector { declarations }
    return code.replace(/([^{}]+)\{([^{}]+)\}/g, (match, selectorPart, declarations) => {
      const selector = selectorPart.trim();

      // 检查选择器黑名单
      if (isSelectorBlacklisted(selector, config)) {
        return match;
      }

      // 处理声明部分
      let processedDeclarations = declarations;

      // 先处理 linear-vpx 函数
      if (processedDeclarations.includes('linear-vpx')) {
        processedDeclarations = convertLinearVpx(processedDeclarations, config, filename);
      }

      // 检查CSS变量并处理 vpx 单位
      if (processedDeclarations.includes('vpx')) {
        // 分别处理每个声明
        processedDeclarations = processedDeclarations.replace(
          /(--[a-zA-Z0-9-_]+)\s*:\s*([^;]+);/g,
          (declMatch, varName, varValue) => {
            // CSS 变量黑名单检查
            if (isVariableBlacklisted(varName, config)) {
              return declMatch;
            }
            // 转换变量值中的 vpx
            if (varValue.includes('vpx')) {
              const converted = convertVpxUnits(varValue, config, filename, selector);
              return `${varName}: ${converted};`;
            }
            return declMatch;
          },
        );

        // 处理非变量的普通声明
        processedDeclarations = processedDeclarations.replace(
          /([a-zA-Z0-9-]+)\s*:\s*([^;]+);/g,
          (declMatch, prop, value) => {
            // 跳过已处理的CSS变量
            if (prop.startsWith('--')) {
              return declMatch;
            }
            // 转换值中的 vpx
            if (value.includes('vpx')) {
              const converted = convertVpxUnits(value, config, filename, selector);
              return `${prop}: ${converted};`;
            }
            return declMatch;
          },
        );
      }

      return `${selectorPart}{${processedDeclarations}}`;
    });
  };

  /**
   * 主转换函数
   */
  const transform = (code, filename) => {
    if (!code.includes('vpx')) {
      return code;
    }

    let result = code;
    
    // 临时占位符，用于保护媒体查询内容
    const mediaQueryPlaceholders = [];
    
    // 先提取并处理媒体查询块（使用更好的匹配逻辑）
    let mediaQueryRegex = /@media\s+([^{]+)\{/g;
    let match;
    let lastIndex = 0;
    let newResult = '';
    
    while ((match = mediaQueryRegex.exec(result)) !== null) {
      const startIndex = match.index;
      const mediaQuery = match[1];
      
      // 找到匹配的闭合括号
      let braceCount = 1;
      let endIndex = mediaQueryRegex.lastIndex;
      
      while (braceCount > 0 && endIndex < result.length) {
        if (result[endIndex] === '{') braceCount++;
        if (result[endIndex] === '}') braceCount--;
        endIndex++;
      }
      
      if (braceCount === 0) {
        // 提取媒体查询内容
        const content = result.substring(mediaQueryRegex.lastIndex, endIndex - 1);
        const mqStr = `@media ${mediaQuery.trim()}`;
        const mqConfig = getMediaQueryConfig(mqStr);

        // 处理媒体查询内的内容
        let processedContent = content;

        if (processedContent.includes('{')) {
          processedContent = processRuleBlock(processedContent, mqConfig, filename);
        } else {
          if (processedContent.includes('linear-vpx')) {
            processedContent = convertLinearVpx(processedContent, mqConfig, filename);
          }
          if (processedContent.includes('vpx')) {
            processedContent = convertVpxUnits(processedContent, mqConfig, filename);
          }
        }

        const processed = `@media ${mediaQuery}{${processedContent}}`;
        const placeholder = `__MEDIA_QUERY_${mediaQueryPlaceholders.length}__`;
        mediaQueryPlaceholders.push(processed);
        
        // 添加未处理的部分和占位符
        newResult += result.substring(lastIndex, startIndex) + placeholder;
        lastIndex = endIndex;
      }
    }
    
    // 添加剩余部分
    newResult += result.substring(lastIndex);
    result = newResult;

    // 处理非媒体查询的规则块
    result = processRuleBlock(result, opts, filename);

    // 恢复媒体查询
    mediaQueryPlaceholders.forEach((mq, index) => {
      result = result.replace(`__MEDIA_QUERY_${index}__`, mq);
    });

    return result;
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

      conversions.length = 0; // 清空转换记录

      const result = transform(code, id);

      // 输出日志
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
