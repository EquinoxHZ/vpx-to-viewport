/**
 * VPX 核心转换模块
 * 被 PostCSS 插件、Vite 插件和 Webpack Loader 共享
 */

const CSS_LIKE_FILE = /\.(?:css|scss|sass|less|styl|stylus)$/i;

// CSS <number>：允许省略整数部分（.5）和科学计数法（1e3）
const NUMBER = '-?(?:\\d+(?:\\.\\d+)?|\\.\\d+)(?:[eE][+-]?\\d+)?';
const VPX_UNIT = new RegExp(`(${NUMBER})(max|min|c)?vpx`, 'gi');
const LINEAR_VPX = new RegExp(
  `linear-vpx\\(\\s*(${NUMBER})\\s*,\\s*(${NUMBER})\\s*(?:,\\s*(${NUMBER})\\s*,\\s*(${NUMBER}))?\\s*\\)`,
  'gi',
);

/**
 * CSS 单位大小写不敏感，入口判断也必须如此
 */
function hasVpx(code) {
  return /vpx/i.test(code);
}

function hasLinearVpx(code) {
  return /linear-vpx/i.test(code);
}

// 值里不应被改写的片段：url(...) 是资源路径，引号字符串在 CSS 里是字面文本
const URL_LITERAL = /url\(\s*(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[^)]*)\)/gi;
const URL_OR_STRING_LITERAL =
  /url\(\s*(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[^)]*)\)|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/gi;

/**
 * 判断模块 id 是否按 CSS 语义处理（字符串是字面文本，而不是值）
 */
function isCssLikeFile(filename) {
  if (!filename) return true;

  const id = String(filename);
  if (/[?&]vue&type=style/.test(id)) return true;

  return CSS_LIKE_FILE.test(id.split('?')[0]);
}

/**
 * 把值拆成「可转换」与「需原样保留」两类片段，只对前者应用 convert
 */
function convertOutsideLiterals(value, convert, skipStrings) {
  const literals = skipStrings ? URL_OR_STRING_LITERAL : URL_LITERAL;
  literals.lastIndex = 0;

  let result = '';
  let lastIndex = 0;
  let match;

  while ((match = literals.exec(value)) !== null) {
    result += convert(value.slice(lastIndex, match.index)) + match[0];
    lastIndex = match.index + match[0].length;
  }

  return result + convert(value.slice(lastIndex));
}

/**
 * 创建 VPX 转换器
 * @param {Object} options 配置选项
 * @returns {Object} 转换器实例
 */
function createVpxTransformer(options = {}) {
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
    convertInStrings: false,
    logConversions: false,
    logLevel: 'info',
    mediaQueries: {},
  };

  const opts = { ...defaultConfig, ...options };

  // ==================== 参数验证 ====================
  if (opts.viewportWidth <= 0) {
    throw new Error('[vpx-core] viewportWidth 必须大于 0');
  }
  if (opts.unitPrecision < 0 || !Number.isInteger(opts.unitPrecision)) {
    throw new Error('[vpx-core] unitPrecision 必须为非负整数');
  }
  if (opts.minPixelValue < 0) {
    throw new Error('[vpx-core] minPixelValue 不能为负数');
  }
  if (opts.linearMinWidth >= opts.linearMaxWidth) {
    throw new Error('[vpx-core] linearMinWidth 必须小于 linearMaxWidth');
  }
  if (!['silent', 'info', 'verbose'].includes(opts.logLevel)) {
    throw new Error(
      `[vpx-core] 无效的 logLevel: ${opts.logLevel}，应为 'silent', 'info' 或 'verbose'`,
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
   * 生成一个在源码中不存在的占位符前缀，避免源码里的同名字面量被误还原
   */
  const uniquePlaceholderPrefix = (code, base) => {
    let prefix = base;
    while (code.includes(prefix)) {
      prefix += '_';
    }
    return prefix;
  };

  /**
   * 转换 linear-vpx 函数
   */
  const convertLinearVpx = (code, config, filename) => {
    const replaceInChunk = chunk =>
      chunk.replace(LINEAR_VPX, (match, minVal, maxVal, minWidth, maxWidth) => {
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
          console.warn('[vpx-core] linear-vpx: linearMinWidth 和 linearMaxWidth 相同，跳过转换');
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

    return convertOutsideLiterals(code, replaceInChunk, !config.convertInStrings);
  };

  /**
   * 转换 vpx 单位（vpx, maxvpx, minvpx, cvpx）
   */
  const convertVpxUnits = (code, config, filename, selector = 'unknown') => {
    const replaceInChunk = chunk =>
      chunk.replace(VPX_UNIT, (match, num, prefix) => {
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

        const unitType = prefix ? `${prefix.toLowerCase()}vpx` : 'vpx';
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

    return convertOutsideLiterals(code, replaceInChunk, !config.convertInStrings);
  };

  /**
   * 返回字符串字面量结束后的下标（未闭合时止于换行或文件末尾）
   */
  const endOfString = (code, start) => {
    const quote = code[start];
    let i = start + 1;

    while (i < code.length) {
      const ch = code[i];
      if (ch === '\\') {
        i += 2;
        continue;
      }
      if (ch === quote) return i + 1;
      if (ch === '\n') return i;
      i++;
    }

    return code.length;
  };

  /**
   * 单遍扫描样式表：按词法边界（注释 / 字符串 / 圆括号 / 花括号）切分，
   * 只对声明的值做转换；块结构仅用于解析选择器黑名单和媒体查询配置。
   */
  const processStylesheet = (code, filename) => {
    const commentPrefix = uniquePlaceholderPrefix(code, '__CSS_CMT_');
    const comments = [];
    const stack = [];

    // CSS 文件里引号内是字面文本；.vue/.jsx/.tsx 里引号内往往就是值本身
    const cssLike = isCssLikeFile(filename);
    const looseConfigs = new Map();
    const withMode = config => {
      if (cssLike) return config;
      if (!looseConfigs.has(config)) {
        looseConfigs.set(config, { ...config, convertInStrings: true });
      }
      return looseConfigs.get(config);
    };

    let output = '';
    let pending = '';
    let parenDepth = 0;

    // 就近生效：最内层的 @media 决定配置，与 PostCSS 模式一致
    const activeConfig = () => {
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].mediaConfig) return withMode(stack[i].mediaConfig);
      }
      return withMode(opts);
    };

    const activeSelector = () => (stack.length ? stack[stack.length - 1].selector : '');

    const convertValue = (value, config, selector) => {
      let result = value;
      if (hasLinearVpx(result)) {
        result = convertLinearVpx(result, config, filename);
      }
      if (hasVpx(result)) {
        result = convertVpxUnits(result, config, filename, selector || 'unknown');
      }
      return result;
    };

    const processDeclaration = text => {
      if (!hasVpx(text)) return text;

      // 块外的文本不是声明（如 .vue 里的 `<div :style="...">`），改写会损坏源码
      if (stack.length === 0) return text;

      const config = activeConfig();
      const selector = activeSelector();

      const variable = text.match(/^([\s\S]*?)(--[a-zA-Z0-9-_]+)\s*:\s*([\s\S]+)$/);
      if (variable) {
        const [, before, prop, value] = variable;
        return isVariableBlacklisted(prop, config)
          ? text
          : `${before}${prop}: ${convertValue(value, config, selector)}`;
      }

      const declaration = text.match(/^([\s\S]*?)([a-zA-Z0-9-]+)\s*:\s*([\s\S]+)$/);
      if (declaration) {
        const [, before, prop, value] = declaration;
        return isSelectorBlacklisted(selector, config)
          ? text
          : `${before}${prop}: ${convertValue(value, config, selector)}`;
      }

      return text;
    };

    const pushFrame = prelude => {
      const trimmed = prelude.trim();
      const isAtRule = trimmed.startsWith('@');
      const frame = { selector: isAtRule ? '' : trimmed, mediaConfig: null };

      if (isAtRule && /^@media\b/i.test(trimmed)) {
        const params = trimmed.replace(/^@media/i, '').trim();
        frame.mediaConfig = getMediaQueryConfig(`@media ${params}`);
      }

      stack.push(frame);
    };

    const boundary = /[/"'(){};]/g;
    let i = 0;

    while (i < code.length) {
      boundary.lastIndex = i;
      const found = boundary.exec(code);

      if (!found) {
        pending += code.slice(i);
        break;
      }

      pending += code.slice(i, found.index);
      i = found.index;
      const ch = code[i];

      if (ch === '/') {
        if (code[i + 1] === '*') {
          const end = code.indexOf('*/', i + 2);
          const stop = end === -1 ? code.length : end + 2;
          comments.push(code.slice(i, stop));
          pending += `${commentPrefix}${comments.length - 1}__`;
          i = stop;
        } else {
          pending += ch;
          i++;
        }
        continue;
      }

      if (ch === '"' || ch === '\'') {
        // 宽松模式下不把引号当作不透明区域，否则 `:style="{ width: '20vpx' }"` 里的声明扫不到
        if (cssLike) {
          const stop = endOfString(code, i);
          pending += code.slice(i, stop);
          i = stop;
        } else {
          pending += ch;
          i++;
        }
        continue;
      }

      if (ch === '(') {
        parenDepth++;
        pending += ch;
        i++;
        continue;
      }

      if (ch === ')') {
        if (parenDepth > 0) parenDepth--;
        pending += ch;
        i++;
        continue;
      }

      // 圆括号内的 { } ; 属于值的一部分（如 url()、@media 条件），不参与块结构判断
      if (parenDepth > 0) {
        pending += ch;
        i++;
        continue;
      }

      if (ch === '{') {
        output += pending + ch;
        pushFrame(pending);
        pending = '';
        i++;
        continue;
      }

      if (ch === '}') {
        output += processDeclaration(pending) + ch;
        pending = '';
        stack.pop();
        i++;
        continue;
      }

      output += processDeclaration(pending) + ch;
      pending = '';
      i++;
    }

    output += processDeclaration(pending);

    return comments.length === 0
      ? output
      : output.replace(
        new RegExp(`${commentPrefix}(\\d+)__`, 'g'),
        (placeholder, index) => comments[index],
      );
  };

  /**
   * 主转换函数
   */
  const transform = (code, filename) => {
    if (!hasVpx(code)) {
      return code;
    }

    return processStylesheet(code, filename);
  };

  return {
    transform,
    conversions,
    getConversions: () => conversions,
    clearConversions: () => {
      conversions.length = 0;
    },
    // 导出内部函数供高级使用
    utils: {
      normalizeMediaQuery,
      isMediaQueryMatched,
      getMediaQueryConfig,
      isSelectorBlacklisted,
      isVariableBlacklisted,
      convertLinearVpx,
      convertVpxUnits,
    },
  };
}

// CommonJS 导出
module.exports = {
  createVpxTransformer,
  hasVpx,
};

// ES Module 导出 (供现代构建工具使用)
module.exports.default = createVpxTransformer;
