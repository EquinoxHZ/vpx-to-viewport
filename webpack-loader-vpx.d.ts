/**
 * Webpack Loader VPX 的 TypeScript 类型定义
 */

/**
 * 媒体查询特定配置
 */
export interface MediaQueryConfig {
  /** 视口宽度 */
  viewportWidth?: number;
  /** 单位精度 */
  unitPrecision?: number;
  /** 选择器黑名单 */
  selectorBlackList?: Array<string | RegExp>;
  /** CSS变量黑名单 */
  variableBlackList?: Array<string | RegExp>;
  /** 最小转换值 */
  minPixelValue?: number;
  /** maxvpx 的像素值倍数 */
  maxRatio?: number;
  /** minvpx 的像素值倍数 */
  minRatio?: number;
  /** cvpx 的最小值倍数 */
  clampMinRatio?: number | null;
  /** cvpx 的最大值倍数 */
  clampMaxRatio?: number | null;
  /** 线性插值的最小视口宽度 */
  linearMinWidth?: number;
  /** 线性插值的最大视口宽度 */
  linearMaxWidth?: number;
  /** 是否自动为 linear-vpx 添加 clamp 限制 */
  autoClampLinear?: boolean;
}

/**
 * Webpack Loader VPX 配置选项
 */
export interface WebpackLoaderVpxOptions {
  /**
   * 视口宽度（设计稿宽度），默认 375
   * @default 375
   */
  viewportWidth?: number;

  /**
   * 转换后的单位精度（小数点后位数），默认 5
   * @default 5
   */
  unitPrecision?: number;

  /**
   * 选择器黑名单，匹配到的选择器不会进行 vpx 转换
   * 支持字符串和正则表达式
   * @default []
   * @example ['.ignore', /^\.nav-/]
   */
  selectorBlackList?: Array<string | RegExp>;

  /**
   * CSS变量黑名单，匹配到的CSS变量不会进行 vpx 转换
   * 支持字符串和正则表达式
   * @default []
   * @example ['--ignore-var', /^--keep-/]
   */
  variableBlackList?: Array<string | RegExp>;

  /**
   * 最小转换值，小于或等于此值的 vpx 会转换为 px
   * @default 1
   */
  minPixelValue?: number;

  /**
   * maxvpx 单位的像素值倍数
   * 例如：maxvpx 100 在 maxRatio=1 时保持 100px
   * @default 1
   */
  maxRatio?: number;

  /**
   * minvpx 单位的像素值倍数
   * 例如：minvpx 100 在 minRatio=1 时保持 100px
   * @default 1
   */
  minRatio?: number;

  /**
   * cvpx 单位的最小值倍数（用于 clamp 的第一个参数）
   * 如果为 null，则使用 minRatio
   * @default null
   */
  clampMinRatio?: number | null;

  /**
   * cvpx 单位的最大值倍数（用于 clamp 的第三个参数）
   * 如果为 null，则使用 maxRatio
   * @default null
   */
  clampMaxRatio?: number | null;

  /**
   * linear-vpx 函数的默认最小视口宽度
   * @default 1200
   */
  linearMinWidth?: number;

  /**
   * linear-vpx 函数的默认最大视口宽度
   * @default 1920
   */
  linearMaxWidth?: number;

  /**
   * 是否自动为 linear-vpx 函数添加 clamp 限制
   * @default true
   */
  autoClampLinear?: boolean;

  /**
   * 是否记录转换日志
   * @default false
   */
  logConversions?: boolean;

  /**
   * 日志级别
   * - 'silent': 不输出日志
   * - 'info': 输出简要信息
   * - 'verbose': 输出详细信息
   * @default 'info'
   */
  logLevel?: 'silent' | 'info' | 'verbose';

  /**
   * 媒体查询特定配置
   * key 为媒体查询字符串（支持带或不带 @media 前缀）
   * value 为该媒体查询下的配置选项
   * @default {}
   * @example
   * {
   *   '@media (min-width: 768px)': {
   *     viewportWidth: 768,
   *     maxRatio: 1.5
   *   },
   *   '(min-width: 1200px)': {
   *     viewportWidth: 1200
   *   }
   * }
   */
  mediaQueries?: Record<string, MediaQueryConfig>;
}

/**
 * 转换记录
 */
export interface Conversion {
  /** 文件路径 */
  file: string;
  /** 选择器 */
  selector?: string;
  /** 单位类型 */
  type: string;
  /** 原始值 */
  original: string;
  /** 转换后的值 */
  converted: string;
}

/**
 * 转换器接口
 */
export interface Transformer {
  /**
   * 执行转换
   * @param code CSS 代码
   * @param filename 文件名
   * @returns 转换后的代码
   */
  transform(code: string, filename: string): string;

  /**
   * 转换记录列表
   */
  conversions: Conversion[];

  /**
   * 获取转换记录
   */
  getConversions(): Conversion[];

  /**
   * 清空转换记录
   */
  clearConversions(): void;
}

/**
 * 创建转换器实例
 * @param options 配置选项
 * @returns 转换器实例
 */
export function createTransformer(options?: WebpackLoaderVpxOptions): Transformer;

/**
 * Webpack Loader 函数
 * @param source CSS 源代码
 * @returns 转换后的代码
 */
declare function webpackLoaderVpx(source: string): string;

export default webpackLoaderVpx;
