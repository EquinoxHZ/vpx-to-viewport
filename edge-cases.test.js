/**
 * 边界场景测试
 *
 * 覆盖 index.test.js / vite-plugin-vpx.test.js / cross-platform.test.js 之外的
 * 词法、CSS 语法上下文、媒体查询解析、配置极值、插件宿主接口等边界情况。
 *
 * 文件末尾的「已知缺陷」小节用 test.failing 记录期望行为：
 * 对应问题修复后这些用例会报错，届时把 test.failing 改回 test 即可。
 */

const postcss = require('postcss');
const vpxToVwPostCSS = require('./index');
const vitePluginVpx = require('./vite-plugin-vpx.js');
const webpackLoaderVpx = require('./webpack-loader-vpx.js');
const { createVpxTransformer } = require('./vpx-core');

const byPostcss = async (css, options = {}) => {
  const result = await postcss([vpxToVwPostCSS(options)]).process(css, { from: undefined });
  return result.css;
};

const byVite = (css, options = {}, id = 'test.css') => {
  const result = vitePluginVpx(options).transform(css, id);
  return result ? result.code : null;
};

const byWebpack = (css, options = {}) =>
  webpackLoaderVpx.call({ resourcePath: '/test.css', query: options, cacheable() {} }, css);

/** 三种模式输出应完全一致（输入需使用 `prop: value;` 的标准间距形式） */
const expectAllThree = async (css, options, expected) => {
  await expect(byPostcss(css, options)).resolves.toBe(expected);
  expect(byVite(css, options)).toBe(expected);
  expect(byWebpack(css, options)).toBe(expected);
};

describe('边界场景 - 数值词法', () => {
  test('should keep a leading plus sign', async () => {
    await expectAllThree('.t { width: +20vpx; }', {}, '.t { width: +5.33333vw; }');
  });

  test('should treat 0.0vpx as zero and fall back to px', async () => {
    await expectAllThree('.t { width: 0.0vpx; }', { minPixelValue: 0 }, '.t { width: 0px; }');
  });

  test('should compare minPixelValue against the absolute value', async () => {
    // |-1| <= minPixelValue(1)，保留为 px
    await expectAllThree('.t { margin: -1vpx; }', {}, '.t { margin: -1px; }');
  });

  test('should convert a negative value just beyond minPixelValue', async () => {
    await expectAllThree('.t { margin: -1.5vpx; }', {}, '.t { margin: -0.4vw; }');
  });

  test('should support a fractional viewportWidth', async () => {
    await expectAllThree(
      '.t { width: 20vpx; }',
      { viewportWidth: 37.5 },
      '.t { width: 53.33333vw; }',
    );
  });

  test('should convert the unit even when extra characters follow it', async () => {
    // 按「数值 + 单位」就近匹配，尾随字符原样保留
    await expectAllThree('.t { width: 20vpxx; }', {}, '.t { width: 5.33333vwx; }');
  });

  test('should not convert a bare unit without a number', async () => {
    await expectAllThree(
      '.t { width: vpx; height: maxvpx; }',
      {},
      '.t { width: vpx; height: maxvpx; }',
    );
  });

  test('should convert every unit variant inside one shorthand', async () => {
    await expectAllThree(
      '.t { margin: 1vpx 2maxvpx 3minvpx 4cvpx; }',
      { minPixelValue: 0 },
      '.t { margin: 0.26667vw max(0.53333vw, 2px) min(0.8vw, 3px) clamp(4px, 1.06667vw, 4px); }',
    );
  });
});

describe('边界场景 - CSS 语法上下文', () => {
  test('should preserve !important', async () => {
    const css = '.t { width: 20vpx !important; }';
    await expect(byPostcss(css)).resolves.toBe('.t { width: 5.33333vw !important; }');
    expect(byVite(css)).toBe('.t { width: 5.33333vw !important; }');
  });

  test('should convert inside a font shorthand with a slash', async () => {
    const css = '.t { font: 12vpx/1.5 Arial; }';
    await expect(byPostcss(css, { minPixelValue: 0 })).resolves.toBe(
      '.t { font: 3.2vw/1.5 Arial; }',
    );
  });

  test('should convert every value of a multi-line comma separated declaration', async () => {
    const css =
      '.t {\n  box-shadow: 0 2vpx 4vpx rgba(0,0,0,.5),\n    0 8vpx 16vpx rgba(0,0,0,.2);\n}';
    const expected =
      '.t {\n  box-shadow: 0 0.53333vw 1.06667vw rgba(0,0,0,.5),\n    0 2.13333vw 4.26667vw rgba(0,0,0,.2);\n}';
    await expectAllThree(css, {}, expected);
  });

  test('should convert inside a var() fallback', async () => {
    await expectAllThree('.t { width: var(--a, 20vpx); }', {}, '.t { width: var(--a, 5.33333vw); }');
  });

  test('should convert inside nested css functions', async () => {
    await expectAllThree(
      '.t { grid-template-columns: repeat(3, 100vpx); }',
      {},
      '.t { grid-template-columns: repeat(3, 26.66667vw); }',
    );
  });

  test('should not rewrite vpx appearing in a selector name', async () => {
    await expectAllThree('.mt-20vpx { width: 20vpx; }', {}, '.mt-20vpx { width: 5.33333vw; }');
  });

  test('should leave comments untouched', async () => {
    const css = '.t { width: 20vpx; /* 30vpx */ }';
    await expect(byPostcss(css)).resolves.toBe('.t { width: 5.33333vw; /* 30vpx */ }');
    expect(byVite(css)).toBe('.t { width: 5.33333vw; /* 30vpx */ }');
  });

  test('should not convert vpx inside a commented out rule', async () => {
    await expectAllThree(
      '/* .x { width: 20vpx; } */ .a { width: 20vpx; }',
      {},
      '/* .x { width: 20vpx; } */ .a { width: 5.33333vw; }',
    );
  });

  test('should not let a brace inside a comment break block matching', async () => {
    await expectAllThree('.a { /* } */ width: 20vpx; }', {}, '.a { /* } */ width: 5.33333vw; }');
  });

  test('should convert a value that is preceded by an inline comment', async () => {
    await expectAllThree('.a { width: /* c */ 20vpx; }', {}, '.a { width: /* c */ 5.33333vw; }');
  });

  test('should keep @import statements intact', async () => {
    const css = '@import "a.css"; .t { width: 20vpx; }';
    await expect(byPostcss(css)).resolves.toContain('@import "a.css";');
    expect(byVite(css)).toContain('@import "a.css";');
  });

  test('should handle an empty rule block', async () => {
    await expect(byPostcss('.t{}')).resolves.toBe('.t{}');
    expect(byVite('.t{}')).toBeNull();
    expect(byWebpack('.t{}')).toBe('.t{}');
  });

  test('should be idempotent on already converted css', async () => {
    const converted = '.t { width: 5.33333vw; }';
    await expect(byPostcss(converted)).resolves.toBe(converted);
    expect(byVite(converted)).toBeNull();
    expect(byWebpack(converted)).toBe(converted);
  });

  test('should convert declarations inside @supports', async () => {
    const css = '@supports (display: grid) { .t { width: 20vpx; } }';
    await expect(byPostcss(css)).resolves.toContain('5.33333vw');
    expect(byVite(css)).toContain('5.33333vw');
  });
});

describe('边界场景 - 媒体查询', () => {
  test('should accept media query keys with or without the @media prefix', async () => {
    const css = '@media (min-width: 768px) { .t { width: 100vpx; } }';
    const expected = '@media (min-width: 768px) { .t { width: 13.33333vw; } }';

    await expectAllThree(
      css,
      { mediaQueries: { '@media (min-width: 768px)': { viewportWidth: 750 } } },
      expected,
    );
    await expectAllThree(
      css,
      { mediaQueries: { '(min-width: 768px)': { viewportWidth: 750 } } },
      expected,
    );
  });

  test('should fall back to the base config when no media query matches', async () => {
    await expectAllThree(
      '@media print { .t { width: 100vpx; } }',
      { mediaQueries: { '(min-width: 768px)': { viewportWidth: 750 } } },
      '@media print { .t { width: 26.66667vw; } }',
    );
  });

  test('should inherit unspecified options from the base config', async () => {
    // 媒体查询只覆写 viewportWidth，maxRatio 仍取基础配置的 2
    await expectAllThree(
      '@media (min-width: 768px) { .t { width: 20maxvpx; } }',
      { mediaQueries: { '(min-width: 768px)': { viewportWidth: 750 } }, maxRatio: 2 },
      '@media (min-width: 768px) { .t { width: max(2.66667vw, 40px); } }',
    );
  });

  test('should handle a media query block without a rule wrapper', async () => {
    await expectAllThree(
      '@media (min-width: 768px) { width: 100vpx; }',
      {},
      '@media (min-width: 768px) { width: 26.66667vw; }',
    );
  });

  test('should handle many sibling media queries without cross contamination', () => {
    const css = Array.from(
      { length: 12 },
      (_, i) => `@media (min-width: ${i}px) { .m${i} { width: ${100 + i}vpx; } }`,
    ).join('');

    const output = byVite(css);

    expect(output.match(/@media/g)).toHaveLength(12);
    expect(output).toContain('.m0 { width: 26.66667vw; }');
    expect(output).toContain('.m11 { width: 29.6vw; }');
    expect(output).not.toContain('vpx');
    expect(output).not.toContain('__MEDIA_QUERY_');
  });

  test('should ignore an empty media query block', async () => {
    await expect(byPostcss('@media {}')).resolves.toBe('@media {}');
    expect(byVite('@media {}')).toBeNull();
  });

  test('should handle nested media queries without duplicating content', async () => {
    await expectAllThree(
      '@media screen { @media (min-width: 768px) { .t { width: 100vpx; } } }',
      {},
      '@media screen { @media (min-width: 768px) { .t { width: 26.66667vw; } } }',
    );
  });

  test('should handle triple nested media queries', () => {
    const css = '@media screen { @media print { @media (min-width: 768px) { .t { width: 100vpx; } } } }';
    expect(byVite(css)).toBe(
      '@media screen { @media print { @media (min-width: 768px) { .t { width: 26.66667vw; } } } }',
    );
  });

  test('should not treat a placeholder-looking literal in the source as an internal token', async () => {
    await expectAllThree(
      '.a { content: "__MEDIA_QUERY_0__"; } @media (min-width: 768px) { .b { width: 100vpx; } }',
      {},
      '.a { content: "__MEDIA_QUERY_0__"; } @media (min-width: 768px) { .b { width: 26.66667vw; } }',
    );
  });

  test('should not interpret replacement patterns when restoring media queries', async () => {
    await expectAllThree(
      '@media (min-width: 768px) { .b { content: "$&"; width: 100vpx; } }',
      {},
      '@media (min-width: 768px) { .b { content: "$&"; width: 26.66667vw; } }',
    );
  });

  test('should let the innermost media query win', async () => {
    await expectAllThree(
      '@media screen { @media (min-width: 1200px) { .t { width: 100vpx; } } }',
      { mediaQueries: { '(min-width: 1200px)': { viewportWidth: 1920 } } },
      '@media screen { @media (min-width: 1200px) { .t { width: 5.20833vw; } } }',
    );
  });

  test('should resolve a media query nested inside @supports', async () => {
    await expectAllThree(
      '@supports (display: grid) { @media (min-width: 1200px) { .t { width: 100vpx; } } }',
      { mediaQueries: { '(min-width: 1200px)': { viewportWidth: 1920 } } },
      '@supports (display: grid) { @media (min-width: 1200px) { .t { width: 5.20833vw; } } }',
    );
  });
});

describe('边界场景 - 词法感知', () => {
  test('should not let a closing brace inside a string end the block', async () => {
    await expectAllThree(
      '.a { content: "}"; width: 20vpx; }',
      {},
      '.a { content: "}"; width: 5.33333vw; }',
    );
  });

  test('should not let a semicolon or brace inside a string split declarations', async () => {
    await expectAllThree(
      '.a { content: "a;b{c}"; width: 20vpx; }',
      {},
      '.a { content: "a;b{c}"; width: 5.33333vw; }',
    );
  });

  test('should handle single quoted strings', async () => {
    await expectAllThree(
      '.a { content: \'}\'; width: 20vpx; }',
      {},
      '.a { content: \'}\'; width: 5.33333vw; }',
    );
  });

  test('should handle an escaped quote inside a string', async () => {
    await expectAllThree(
      '.a { content: "a\\"}"; width: 20vpx; }',
      {},
      '.a { content: "a\\"}"; width: 5.33333vw; }',
    );
  });

  test('should not let a semicolon inside url() split declarations', async () => {
    await expectAllThree(
      '.a { background: url(data:image/svg+xml;charset=utf8,%3Csvg%3E); width: 20vpx; }',
      {},
      '.a { background: url(data:image/svg+xml;charset=utf8,%3Csvg%3E); width: 5.33333vw; }',
    );
  });

  test('should keep converting declarations that follow a comment', async () => {
    await expectAllThree(
      '.a { width: 20vpx; /* keep 30vpx */ height: 40vpx; }',
      {},
      '.a { width: 5.33333vw; /* keep 30vpx */ height: 10.66667vw; }',
    );
  });

  test('should apply selectorBlackList to declarations but not to custom properties', async () => {
    await expectAllThree(
      '.ignore { --a: 20vpx; width: 20vpx; }',
      { selectorBlackList: ['.ignore'] },
      '.ignore { --a: 5.33333vw; width: 20vpx; }',
    );
  });
});

describe('边界场景 - linear-vpx', () => {
  test('should skip linear-vpx with a single argument', async () => {
    await expectAllThree('.t { width: linear-vpx(10); }', {}, '.t { width: linear-vpx(10); }');
  });

  test('should skip linear-vpx with non numeric arguments', async () => {
    await expectAllThree('.t { width: linear-vpx(a, b); }', {}, '.t { width: linear-vpx(a, b); }');
  });

  test('should skip and warn when the viewport range collapses', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    await expect(byPostcss('.t { width: linear-vpx(10, 20, 500, 500); }')).resolves.toBe(
      '.t { width: linear-vpx(10, 20, 500, 500); }',
    );
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('linearMinWidth 和 linearMaxWidth 相同'),
    );

    warn.mockRestore();
  });

  test('should produce a negative denominator for a reversed viewport range', async () => {
    await expectAllThree(
      '.t { width: linear-vpx(10, 20, 1920, 1200); }',
      {},
      '.t { width: clamp(10px, calc(10px + 10 * (100vw - 1920px) / -720), 20px); }',
    );
  });

  test('should round linear-vpx boundaries with unitPrecision 0', async () => {
    await expectAllThree(
      '.t { width: linear-vpx(10.567, 20.123); }',
      { unitPrecision: 0 },
      '.t { width: clamp(11px, calc(11px + 10 * (100vw - 1200px) / 720), 20px); }',
    );
  });

  test('should convert linear-vpx nested inside calc()', async () => {
    await expectAllThree(
      '.t { width: calc(linear-vpx(10, 20) + 5px); }',
      {},
      '.t { width: calc(clamp(10px, calc(10px + 10 * (100vw - 1200px) / 720), 20px) + 5px); }',
    );
  });
});

describe('边界场景 - 配置参数', () => {
  test('should blacklist everything when the list contains an empty string', async () => {
    // '' 是任意字符串的子串，等价于全量禁用
    await expectAllThree(
      '.t { width: 20vpx; }',
      { selectorBlackList: [''] },
      '.t { width: 20vpx; }',
    );
  });

  test('should allow a negative maxRatio', async () => {
    await expectAllThree(
      '.t { width: 20maxvpx; }',
      { maxRatio: -1 },
      '.t { width: max(5.33333vw, -20px); }',
    );
  });

  test('should emit clamp() as configured even when the min ratio exceeds the max ratio', async () => {
    await expectAllThree(
      '.t { width: 20cvpx; }',
      { clampMinRatio: 4, clampMaxRatio: 1 },
      '.t { width: clamp(80px, 5.33333vw, 20px); }',
    );
  });

  test('should accept clamp ratios explicitly set to 0', async () => {
    await expectAllThree(
      '.t { width: 20cvpx; }',
      { clampMinRatio: 0, clampMaxRatio: 0 },
      '.t { width: clamp(0px, 5.33333vw, 0px); }',
    );
  });

  test('should only apply variableBlackList to custom properties', async () => {
    await expectAllThree(
      '.t { --a: 20vpx; width: 20vpx; }',
      { variableBlackList: ['--a'] },
      '.t { --a: 20vpx; width: 5.33333vw; }',
    );
  });

  test('should reject an unknown logLevel at construction time', () => {
    expect(() => createVpxTransformer({ logLevel: 'trace' })).toThrow('[vpx-core] 无效的 logLevel');
  });

  test('should validate options in every host', () => {
    expect(() => vpxToVwPostCSS({ viewportWidth: 0 })).toThrow('viewportWidth 必须大于 0');
    expect(() => byVite('.t { width: 20vpx; }', { viewportWidth: 0 })).toThrow(
      'viewportWidth 必须大于 0',
    );
    expect(() => byWebpack('.t { width: 20vpx; }', { viewportWidth: 0 })).toThrow(
      'viewportWidth 必须大于 0',
    );
  });
});

describe('边界场景 - 核心转换器 API', () => {
  test('should record and clear conversions', () => {
    const transformer = createVpxTransformer({ logConversions: true });
    transformer.transform('.a{width:20vpx}', 'a.css');

    expect(transformer.getConversions()).toEqual([
      { file: 'a.css', selector: '.a', type: 'vpx', original: '20vpx', converted: '5.33333vw' },
    ]);

    transformer.clearConversions();
    expect(transformer.getConversions()).toHaveLength(0);
  });

  test('should not record conversions when logConversions is off', () => {
    const transformer = createVpxTransformer();
    transformer.transform('.a{width:20vpx}', 'a.css');
    expect(transformer.getConversions()).toHaveLength(0);
  });

  test('should return the input untouched when it contains no vpx', () => {
    const transformer = createVpxTransformer();
    expect(transformer.transform('.a{color:red}', 'a.css')).toBe('.a{color:red}');
  });

  test('should treat the filename as optional', () => {
    const transformer = createVpxTransformer();
    expect(transformer.transform('.a{width:20vpx}')).toBe('.a{width: 5.33333vw}');
  });

  test('should expose media query utils for advanced usage', () => {
    const { utils } = createVpxTransformer();

    expect(utils.normalizeMediaQuery('@media   (min-width: 768px)')).toBe('(min-width: 768px)');
    expect(
      utils.isMediaQueryMatched('@media screen and (min-width: 768px)', '(min-width: 768px)'),
    ).toBe(true);
    expect(utils.isMediaQueryMatched('@media print', '(min-width: 768px)')).toBe(false);
  });
});

describe('边界场景 - Vite 插件宿主接口', () => {
  test('should expose pre and post plugins while staying callable directly', () => {
    const plugin = vitePluginVpx({});
    expect(Array.isArray(plugin)).toBe(true);
    expect(plugin).toHaveLength(2);
    expect(typeof plugin.transform).toBe('function');
  });

  test('should skip files outside the include list', () => {
    expect(byVite('.a{width:20vpx}', {}, 'a.txt')).toBeNull();
  });

  test('should skip excluded paths', () => {
    expect(byVite('.a{width:20vpx}', {}, '/project/node_modules/x/a.css')).toBeNull();
  });

  test('should skip a missing module id', () => {
    expect(byVite('.a{width:20vpx}', {}, null)).toBeNull();
  });

  test('should strip vite query suffixes before matching include patterns', () => {
    expect(byVite('.a{width:20vpx}', {}, 'a.css?direct')).toBe('.a{width: 5.33333vw}');
    expect(byVite('.a{width:20vpx}', {}, 'Foo.vue?vue&type=style&index=0&lang.css')).toBe(
      '.a{width: 5.33333vw}',
    );
  });

  test('should honour a custom include pattern', () => {
    const options = { include: [/\.custom$/] };
    expect(byVite('.a{width:20vpx}', options, 'a.custom')).toBe('.a{width: 5.33333vw}');
    expect(byVite('.a{width:20vpx}', options, 'a.css')).toBeNull();
  });
});

describe('边界场景 - Webpack Loader 宿主接口', () => {
  test('should work without loader options', () => {
    const output = webpackLoaderVpx.call(
      { resourcePath: '/a.css', cacheable() {} },
      '.a{width:20vpx}',
    );
    expect(output).toBe('.a{width: 5.33333vw}');
  });

  test('should mark the result as cacheable', () => {
    const cacheable = jest.fn();
    webpackLoaderVpx.call({ resourcePath: '/a.css', query: {}, cacheable }, '.a{width:20vpx}');
    expect(cacheable).toHaveBeenCalled();
  });

  test('should short circuit sources without vpx', () => {
    expect(byWebpack('.a{color:red}')).toBe('.a{color:red}');
  });
});

describe('边界场景 - 跨模式行为差异（当前实现快照）', () => {
  test('postcss rejects malformed css while the string based transformers still convert it', async () => {
    const malformed = '.t { width: 20vpx;';
    await expect(byPostcss(malformed)).rejects.toThrow('Unclosed block');
    expect(byVite(malformed)).toBe('.t { width: 5.33333vw;');
    expect(byWebpack(malformed)).toBe('.t { width: 5.33333vw;');
  });

  test('postcss preserves declaration whitespace while the string based transformers normalize it', async () => {
    const css = '.t { width:    20vpx   ; }';
    await expect(byPostcss(css)).resolves.toBe('.t { width:    5.33333vw; }');
    expect(byVite(css)).toBe('.t { width: 5.33333vw   ; }');
  });

  test('string values are left alone by every mode', async () => {
    await expectAllThree('.t::after { content: "20vpx"; }', {}, '.t::after { content: "20vpx"; }');
  });
});

describe('边界场景 - 字面量不被误伤', () => {
  test('should not convert inside strings or url()', async () => {
    await expectAllThree(
      '.foo { content: "10vpx"; --label: "20vpx"; background: url("image-30vpx.png"); width: 40vpx; }',
      {},
      '.foo { content: "10vpx"; --label: "20vpx"; background: url("image-30vpx.png"); width: 10.66667vw; }',
    );
  });

  test('should not convert inside an unquoted url()', async () => {
    await expectAllThree(
      '.foo { background: url(image-30vpx.png); width: 20vpx; }',
      {},
      '.foo { background: url(image-30vpx.png); width: 5.33333vw; }',
    );
  });

  test('should not expand linear-vpx() written inside a string', async () => {
    await expectAllThree(
      '.foo::before { content: "linear-vpx(16, 24)"; width: linear-vpx(16, 24); }',
      {},
      '.foo::before { content: "linear-vpx(16, 24)"; width: clamp(16px, calc(16px + 8 * (100vw - 1200px) / 720), 24px); }',
    );
  });

  test('should not touch font-family names', async () => {
    await expectAllThree(
      '.foo { font-family: "Font 20vpx", sans-serif; width: 20vpx; }',
      {},
      '.foo { font-family: "Font 20vpx", sans-serif; width: 5.33333vw; }',
    );
  });

  test('should not touch grid-template-areas', async () => {
    await expectAllThree(
      '.foo { grid-template-areas: "a20vpx b"; width: 20vpx; }',
      {},
      '.foo { grid-template-areas: "a20vpx b"; width: 5.33333vw; }',
    );
  });

  test('should still convert strings in js-like files, where they carry the value', () => {
    expect(byVite('const s = { width: \'20vpx\', fontSize: \'16vpx\' };', {}, 'a.jsx')).toBe(
      'const s = { width: \'5.33333vw\', fontSize: \'4.26667vw\' };',
    );
    expect(byVite('const el = <div style={{ width: \'20vpx\' }} />;', {}, 'a.tsx')).toBe(
      'const el = <div style={{ width: \'5.33333vw\' }} />;',
    );
  });

  test('should convert a vue inline style binding without mangling the tag', () => {
    expect(byVite('<div :style="{ width: \'20vpx\' }"></div>', {}, 'a.vue')).toBe(
      '<div :style="{ width: \'5.33333vw\' }"></div>',
    );
  });

  test('should apply css semantics to vue style virtual modules', () => {
    expect(
      byVite(
        '.a { content: "10vpx"; height: 40vpx; }',
        {},
        'a.vue?vue&type=style&index=0&lang.css',
      ),
    ).toBe('.a { content: "10vpx"; height: 10.66667vw; }');
  });

  test('should not treat markup outside a block as a declaration', () => {
    expect(byVite('<div data-x="a: 20vpx"></div>', {}, 'a.vue')).toBe(
      '<div data-x="a: 20vpx"></div>',
    );
  });

  test('should allow opting back into string conversion', async () => {
    await expect(byPostcss('.t { content: "20vpx"; }', { convertInStrings: true })).resolves.toBe(
      '.t { content: "5.33333vw"; }',
    );
  });
});

/**
 * 已知缺陷：以下断言描述期望行为，当前实现无法满足。
 */
describe('已知缺陷（期望行为，当前未实现）', () => {
  test.failing('css units should be case insensitive', async () => {
    // 转换正则本身忽略大小写，但入口处 `includes('vpx')` 守卫是大小写敏感的
    await expect(byPostcss('.t { width: 20VPX; }')).resolves.toBe('.t { width: 5.33333vw; }');
  });

  test.failing('should convert numbers written without a leading zero', async () => {
    // 当前输出 `.1.33333vw`，因为数值正则要求小数点前必须有数字
    await expect(byPostcss('.t { width: .5vpx; }', { minPixelValue: 0 })).resolves.toBe(
      '.t { width: 0.13333vw; }',
    );
  });

  test.failing('should not corrupt values written in scientific notation', async () => {
    // 当前输出 `1e0.8vw`
    await expect(byPostcss('.t { width: 1e3vpx; }')).resolves.not.toContain('1e0.8vw');
  });
});
