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

const { createVpxTransformer } = require('./vpx-core');

function vitePluginVpx(options = {}) {
  const defaultConfig = {
    include: [/\.css$/, /\.scss$/, /\.sass$/, /\.less$/, /\.styl$/, /\.vue$/, /\.jsx$/, /\.tsx$/],
    exclude: [/node_modules/],
  };

  const opts = { ...defaultConfig, ...options };

  // 仅 CSS / 预处理器样式文件的匹配（用于 post 阶段，捕获 postcss-import 内联进来的 @import 内容）
  const cssIncludePatterns = [/\.css$/, /\.scss$/, /\.sass$/, /\.less$/, /\.styl$/];
  // Vue SFC style 虚拟模块标识，如 `Foo.vue?vue&type=style&index=0&lang.css`
  const vueStyleQueryRe = /\?vue&type=style/;

  /**
   * 检查文件是否应该被处理（pre 阶段，匹配用户配置的 include / exclude）
   */
  const shouldTransform = id => {
    if (!id) return false;

    // 移除 Vite 在 dev 模式下添加的查询参数 (如 ?direct, ?used, ?inline 等)
    const cleanId = id.split('?')[0];

    // 检查排除规则
    if (
      opts.exclude.some(pattern => {
        if (typeof pattern === 'string') return id.includes(pattern);
        return pattern.test(id);
      })
    ) {
      return false;
    }

    // 检查包含规则 - 使用清理后的 ID
    return opts.include.some(pattern => {
      if (typeof pattern === 'string') return cleanId.includes(pattern);
      return pattern.test(cleanId);
    });
  };

  /**
   * 检查是否是 CSS 类文件（post 阶段使用）
   * 用于捕获被 postcss-import 内联进来的 @import 内容
   */
  const shouldTransformCss = id => {
    if (!id) return false;

    if (
      opts.exclude.some(pattern => {
        if (typeof pattern === 'string') return id.includes(pattern);
        return pattern.test(id);
      })
    ) {
      return false;
    }

    const cleanId = id.split('?')[0];
    if (cssIncludePatterns.some(re => re.test(cleanId))) return true;
    // Vue 的 <style> 块虚拟模块
    if (vueStyleQueryRe.test(id)) return true;
    return false;
  };

  const runTransform = (code, id) => {
    const transformer = createVpxTransformer(opts);
    const result = transformer.transform(code, id);

    const conversions = transformer.getConversions();
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

    return { code: result, map: null };
  };

  // Vite Plugin 接口
  //
  // 为什么返回两个插件：
  //   1) pre 阶段：处理用户源代码（.vue / .jsx / .tsx 以及独立的 .css 等），
  //      在其他插件（如 vue 的 SFC 拆分、css 预处理）之前先把 vpx 转成 vw。
  //   2) post 阶段：只处理 CSS 类模块。Vite 的 css 插件会用 `postcss-import`
  //      把 `<style>` 或 `.css` 中 `@import` 的目标文件**直接从磁盘读取并内联**，
  //      不会走 Vite 的 transform pipeline，所以那些 @import 进来的 vpx 无法在 pre 阶段被捕获。
  //      在 post 阶段对 css 内容再扫描一次即可覆盖到。
  //      由于已经被转成 vw 的内容不再匹配 vpx 正则，post 阶段重复扫描是幂等的。
  const prePlugin = {
    name: 'vite-plugin-vpx',
    enforce: 'pre',
    transform(code, id) {
      if (!shouldTransform(id)) return null;
      if (!code.includes('vpx')) return null;
      return runTransform(code, id);
    },
  };

  const postPlugin = {
    name: 'vite-plugin-vpx:post',
    enforce: 'post',
    transform(code, id) {
      if (!shouldTransformCss(id)) return null;
      if (!code.includes('vpx')) return null;
      return runTransform(code, id);
    },

    // build 阶段兜底：
    //   dev 模式下 @import 的内容在 transform 链里被 `post` 钩子捕获即可。
    //   但 build 模式下，CSS 的合并 / 压缩 / 产物输出发生在 Rollup 的
    //   generateBundle 阶段（由 vite:css-post 处理），@import 内联进来的内容
    //   在 transform 链中无法被稳定捕获，导致这部分 vpx 漏转。
    //   这里直接对最终输出的 .css 资源再扫描一次，确保完整覆盖。
    //   已转成 vw 的内容不再匹配 vpx 正则，二次扫描是幂等的。
    generateBundle(_outputOptions, bundle) {
      for (const fileName of Object.keys(bundle)) {
        if (!fileName.endsWith('.css')) continue;

        const asset = bundle[fileName];
        // 只处理 CSS asset（非 chunk），source 为字符串
        if (!asset || asset.type !== 'asset') continue;

        const source = typeof asset.source === 'string'
          ? asset.source
          : Buffer.isBuffer(asset.source)
            ? asset.source.toString('utf-8')
            : null;
        if (source === null || !source.includes('vpx')) continue;

        const result = runTransform(source, fileName);
        asset.source = result.code;
      }
    },
  };

  // Vite 接受插件数组并会自动展平。同时为了向后兼容旧用法
  // （测试、benchmark 直接调用 `plugin.transform(...)` / 读取 `plugin.name`），
  // 在数组对象上挂载 pre 插件的 name / enforce / transform。
  const plugins = [prePlugin, postPlugin];
  plugins.name = prePlugin.name;
  plugins.enforce = prePlugin.enforce;
  plugins.transform = prePlugin.transform;
  return plugins;
}

// CommonJS 导出
module.exports = vitePluginVpx;
// ES Module 导出 (供 Vite 使用)
module.exports.default = vitePluginVpx;
