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
  /** 是否记录转换日志，默认 false */
  logConversions?: boolean;
  /** 日志级别，'silent', 'info', 'verbose'，默认 'info' */
  logLevel?: 'silent' | 'info' | 'verbose';
  /**
   * 媒体查询配置：为不同媒体条件提供独立的转换参数。
   *
   * Key 支持以下形式：
   * - 完整形式："@media (min-width: 768px)" （推荐，保持语义明确）
   * - 省略 @media："(min-width: 768px)"
   * - 仅条件片段："min-width: 768px"（内部会做模糊匹配）
   *
   * Value 仅允许覆盖部分核心数值参数；未声明的字段会自动继承顶层配置：
   * - viewportWidth
   * - unitPrecision
   * - minPixelValue
   * - maxRatio / minRatio
   * - clampMaxRatio / clampMinRatio
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
}

declare const vpxToVw: {
  (options?: VpxToVwOptions): {
    postcssPlugin: string;
    Declaration(decl: any): void;
  };
  postcss: boolean;
};

export default vpxToVw;
