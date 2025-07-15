export interface VpxToVwOptions {
  /** 视口宽度，默认 375 */
  viewportWidth?: number;
  /** 精度，默认 5 */
  unitPrecision?: number;
  /** 选择器黑名单 */
  selectorBlackList?: (string | RegExp)[];
  /** CSS变量黑名单 */
  variableBlackList?: (string | RegExp)[];
  /** 最小转换值，默认 1 */
  minPixelValue?: number;
  /** 插件标识符，用于区分多个实例 */
  pluginId?: string;
}

declare const vpxToVw: {
  (options?: VpxToVwOptions): {
    postcssPlugin: string;
    Declaration(decl: any): void;
  };
  postcss: boolean;
};

export default vpxToVw;
