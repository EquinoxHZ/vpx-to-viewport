/**
 * Vite Plugin VPX 类型定义
 */

export interface VitePluginVpxOptions {
  /**
   * 视口宽度，默认 375
   */
  viewportWidth?: number;

  /**
   * 单位精度，默认 5
   */
  unitPrecision?: number;

  /**
   * 最小转换值，默认 1
   * 小于此值的 vpx 会被转换为 px
   */
  minPixelValue?: number;

  /**
   * maxvpx 的像素值倍数，默认 1
   */
  maxRatio?: number;

  /**
   * minvpx 的像素值倍数，默认 1
   */
  minRatio?: number;

  /**
   * cvpx 的最小值倍数，默认使用 minRatio
   */
  clampMinRatio?: number | null;

  /**
   * cvpx 的最大值倍数，默认使用 maxRatio
   */
  clampMaxRatio?: number | null;

  /**
   * 线性插值的最小视口宽度，默认 1200
   */
  linearMinWidth?: number;

  /**
   * 线性插值的最大视口宽度，默认 1920
   */
  linearMaxWidth?: number;

  /**
   * 是否自动为 linear-vpx 添加 clamp 限制，默认 true
   */
  autoClampLinear?: boolean;

  /**
   * 选择器黑名单
   * 匹配的选择器中的 vpx 单位不会被转换
   */
  selectorBlackList?: Array<string | RegExp>;

  /**
   * CSS 变量黑名单
   * 匹配的 CSS 变量中的 vpx 单位不会被转换
   */
  variableBlackList?: Array<string | RegExp>;

  /**
   * 是否记录转换日志，默认 false
   */
  logConversions?: boolean;

  /**
   * 日志级别，默认 'info'
   * - 'silent': 不输出任何日志
   * - 'info': 输出简要信息
   * - 'verbose': 输出详细信息
   */
  logLevel?: 'silent' | 'info' | 'verbose';

  /**
   * 媒体查询特定配置
   * 键为媒体查询字符串，值为该媒体查询下的配置选项
   *
   * @example
   * ```javascript
   * {
   *   '@media (min-width: 768px)': {
   *     viewportWidth: 768,
   *     minRatio: 0.8,
   *     maxRatio: 1.5
   *   }
   * }
   * ```
   */
  mediaQueries?: {
    [key: string]: Partial<Omit<VitePluginVpxOptions, 'mediaQueries' | 'include' | 'exclude'>>;
  };

  /**
   * 包含的文件模式
   * 默认: [/\.css$/, /\.scss$/, /\.sass$/, /\.less$/, /\.styl$/, /\.vue$/, /\.jsx$/, /\.tsx$/]
   */
  include?: Array<string | RegExp>;

  /**
   * 排除的文件模式
   * 默认: [/node_modules/]
   */
  exclude?: Array<string | RegExp>;
}

export interface VitePlugin {
  name: string;
  enforce?: 'pre' | 'post';
  transform(code: string, id: string): { code: string; map: null } | null;
}

/**
 * 创建 Vite Plugin VPX 插件实例
 *
 * @param options - 插件配置选项
 * @returns Vite 插件对象
 *
 * @example
 * ```javascript
 * // vite.config.js
 * import { defineConfig } from 'vite';
 * import vitePluginVpx from 'postcss-vpx-to-vw/vite-plugin-vpx';
 *
 * export default defineConfig({
 *   plugins: [
 *     vitePluginVpx({
 *       viewportWidth: 375,
 *       unitPrecision: 5,
 *       minPixelValue: 1,
 *       selectorBlackList: ['.ignore'],
 *       mediaQueries: {
 *         '@media (min-width: 768px)': {
 *           viewportWidth: 768
 *         }
 *       }
 *     })
 *   ]
 * });
 * ```
 */
export default function vitePluginVpx(options?: VitePluginVpxOptions): VitePlugin;
