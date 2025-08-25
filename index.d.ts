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
}

declare const vpxToVw: {
  (options?: VpxToVwOptions): {
    postcssPlugin: string;
    Declaration(decl: any): void;
  };
  postcss: boolean;
};

export default vpxToVw;
