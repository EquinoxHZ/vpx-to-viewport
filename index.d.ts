export interface VpxToVwOptions {
  /** 视口宽度，默认 375 */
  viewportWidth?: number;
  /** 精度，默认 5 */
  unitPrecision?: number;
  /** 选择器黑名单 */
  selectorBlackList?: (string | RegExp)[];
  /** CSS变量黑名单 */
  variableBlackList?: (string | RegExp)[];
  /** 最小转换值，默认 1，小于此值的 vpx 会转换为 px */
  minPixelValue?: number;
  /** 插件标识符，用于区分多个实例 */
  pluginId?: string;
  /** maxvpx 的像素值倍数，默认 1 */
  maxRatio?: number;
  /** minvpx 的像素值倍数，默认 1 */
  minRatio?: number;
  /** cvpx 的最小值倍数，默认使用 minRatio */
  clampMinRatio?: number;
  /** cvpx 的最大值倍数，默认使用 maxRatio */
  clampMaxRatio?: number;
  /** 线性插值的最小视口宽度，默认 1200 */
  linearMinWidth?: number;
  /** 线性插值的最大视口宽度，默认 1920 */
  linearMaxWidth?: number;
  /** 是否自动为 linear-vpx 添加 clamp 限制，默认 true */
  autoClampLinear?: boolean;
  /** 是否转换引号字符串内的 vpx，默认 false（CSS 里引号内是字面文本）。url() 始终不转换 */
  convertInStrings?: boolean;
  /** 是否记录转换日志，默认 false */
  logConversions?: boolean;
  /** 日志级别，'silent', 'info', 'verbose'，默认 'info' */
  logLevel?: 'silent' | 'info' | 'verbose';
  /**
   * 媒体查询配置：为不同媒体条件提供独立的转换参数。
   *
   * Key 支持以下形式（大小写与空發不敏感，压缩后的 CSS 也能命中）：
   * - 完整形式："@media (min-width: 768px)" （推荐，保持语义明确）
   * - 省略 @media："(min-width: 768px)"
   * - 仅条件片段："min-width: 768px"（等价于带括号的写法）
   * - 仅媒体类型："screen"
   *
   * 匹配规则：配置的条件集合是实际条件集合的子集，且媒体类型兼容。
   * - 条件整组比较，"width: 768px" 不会命中 "(min-width: 768px)"
   * - 带 not 的取反查询不参与子集匹配，only 视为透明
   * - 逗号分隔的媒体查询列表只接受精确匹配
   * - 多个配置同时命中时，取最具体的那个（与书写顺序无关）
   *
   * Value 仅允许覆盖部分核心数值参数；未声明的字段会自动继承顶层配置：
   * - viewportWidth
   * - unitPrecision
   * - minPixelValue
   * - maxRatio / minRatio
   * - clampMaxRatio / clampMinRatio
   * - linearMinWidth / linearMaxWidth
   * - autoClampLinear
   *
   * 不允许在此处配置：pluginId / 日志相关 / 黑名单（保持全局一致性）。
   */
  mediaQueries?: Record<string, MediaQueryOverride>;
}

/**
 * 单个媒体查询的参数覆盖集合。所有字段均为可选，未提供则回退到顶层 VpxToVwOptions 对应值。
 */
export interface MediaQueryOverride {
  /** 针对该媒体条件的视口宽度 */
  viewportWidth?: number;
  /** 精度（小数位） */
  unitPrecision?: number;
  /** 最小转换值，低于此值使用 px */
  minPixelValue?: number;
  /** maxvpx 的像素值倍数 */
  maxRatio?: number;
  /** minvpx 的像素值倍数 */
  minRatio?: number;
  /** cvpx 的最小值倍数 */
  clampMinRatio?: number;
  /** cvpx 的最大值倍数 */
  clampMaxRatio?: number;
  /** 线性插倿的最小视口宽度 */
  linearMinWidth?: number;
  /** 线性插值的最大视口宽度 */
  linearMaxWidth?: number;
  /** 是否自动为 linear-vpx 添加 clamp 限制 */
  autoClampLinear?: boolean;
}

declare const vpxToVw: {
  (options?: VpxToVwOptions): {
    postcssPlugin: string;
    Declaration(decl: any): void;
  };
  postcss: boolean;
};

export default vpxToVw;
