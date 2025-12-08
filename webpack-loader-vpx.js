/**
 * Webpack Loader 独立版：将 vpx 单位转换为 vw
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
 */

const { createVpxTransformer } = require('./vpx-core');

// 可选依赖：loader-utils 和 schema-utils
let getOptions, validateOptions;
try {
  getOptions = require('loader-utils').getOptions;
  validateOptions = require('schema-utils');
} catch (e) {
  // 如果没有安装这些依赖，使用简化版本
  getOptions = function (loaderContext) {
    return loaderContext.query || {};
  };
  validateOptions = function () {
    // 简化版本不做验证
  };
}

// Options Schema 用于验证配置
const schema = {
  type: 'object',
  properties: {
    viewportWidth: {
      type: 'number',
      minimum: 0,
    },
    unitPrecision: {
      type: 'integer',
      minimum: 0,
    },
    selectorBlackList: {
      type: 'array',
    },
    variableBlackList: {
      type: 'array',
    },
    minPixelValue: {
      type: 'number',
      minimum: 0,
    },
    maxRatio: {
      type: 'number',
    },
    minRatio: {
      type: 'number',
    },
    clampMinRatio: {
      anyOf: [{ type: 'number' }, { type: 'null' }],
    },
    clampMaxRatio: {
      anyOf: [{ type: 'number' }, { type: 'null' }],
    },
    linearMinWidth: {
      type: 'number',
    },
    linearMaxWidth: {
      type: 'number',
    },
    autoClampLinear: {
      type: 'boolean',
    },
    logConversions: {
      type: 'boolean',
    },
    logLevel: {
      type: 'string',
      enum: ['silent', 'info', 'verbose'],
    },
    mediaQueries: {
      type: 'object',
    },
  },
  additionalProperties: false,
};

/**
 * Webpack Loader 主函数
 */
function webpackLoaderVpx(source) {
  // 获取 loader 配置
  const options = getOptions(this) || {};

  // 验证配置（如果有 schema-utils）
  if (validateOptions && validateOptions.name !== undefined) {
    try {
      validateOptions(schema, options, {
        name: 'Webpack Loader VPX',
        baseDataPath: 'options',
      });
    } catch (e) {
      // 忽略验证错误
    }
  }

  // 标记为可缓存
  this.cacheable && this.cacheable();

  // 如果源代码不包含 vpx，直接返回
  if (!source.includes('vpx')) {
    return source;
  }

  // 创建转换器（使用共享的核心模块）
  const transformer = createVpxTransformer(options);

  // 执行转换
  const result = transformer.transform(source, this.resourcePath);

  // 输出日志
  const conversions = transformer.getConversions();
  if (options.logConversions && conversions.length > 0 && options.logLevel !== 'silent') {
    if (options.logLevel === 'verbose') {
      console.log(`\n[webpack-loader-vpx] ${this.resourcePath}:`);
      conversions.forEach(conv => {
        console.log(`  ${conv.selector || conv.type}: ${conv.original} -> ${conv.converted}`);
      });
    } else if (options.logLevel === 'info') {
      console.log(
        `[webpack-loader-vpx] ${this.resourcePath}: 转换了 ${conversions.length} 个 vpx 单位`,
      );
    }
  }

  return result;
}

// 导出 loader 和工具函数
module.exports = webpackLoaderVpx;
module.exports.createTransformer = createVpxTransformer;
