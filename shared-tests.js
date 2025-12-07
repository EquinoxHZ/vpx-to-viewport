/**
 * 共享测试用例
 * 用于 PostCSS 插件模式和 Vite Plugin 模式的一致性测试
 * 包含 index.test.js 中的所有测试用例
 */

// 基础转换测试
const basicTests = [
  {
    name: 'should convert vpx to vw',
    input: '.test { font-size: 36vpx; width: 200vpx; }',
    expected: '.test { font-size: 9.6vw; width: 53.33333vw; }',
    options: {},
  },
  {
    name: 'should not convert non-vpx values',
    input: '.test { font-size: 36px; width: 200em; }',
    expected: '.test { font-size: 36px; width: 200em; }',
    options: {},
  },
  {
    name: 'should handle empty input',
    input: '',
    expected: '',
    options: {},
  },
  {
    name: 'should handle input with no vpx units',
    input: '.test { color: red; }',
    expected: '.test { color: red; }',
    options: {},
  },
  {
    name: 'should handle decimal values',
    input: '.test { font-size: 36.5vpx; }',
    expected: '.test { font-size: 9.73333vw; }',
    options: {},
  },
  {
    name: 'should handle multiple vpx values in one declaration',
    input: '.test { margin: 10vpx 20vpx; }',
    expected: '.test { margin: 2.66667vw 5.33333vw; }',
    options: {},
  },
  {
    name: 'should handle invalid vpx values',
    input: '.test { font-size: vpx; width: abcvpx; }',
    expected: '.test { font-size: vpx; width: abcvpx; }',
    options: {},
  },
  {
    name: 'should handle high precision values',
    input: '.test { font-size: 36.123456789vpx; }',
    expected: '.test { font-size: 9.63292vw; }',
    options: {},
  },
];

// 单位变体测试
const unitVariantTests = [
  {
    name: 'should convert maxvpx to max(vw, Npx)',
    input: '.test { font-size: 36maxvpx; width: 200maxvpx; }',
    expected: '.test { font-size: max(9.6vw, 36px); width: max(53.33333vw, 200px); }',
    options: {},
  },
  {
    name: 'should convert minvpx to min(vw, Npx)',
    input: '.test { font-size: 36minvpx; width: 200minvpx; }',
    expected: '.test { font-size: min(9.6vw, 36px); width: min(53.33333vw, 200px); }',
    options: {},
  },
  {
    name: 'should convert cvpx to clamp(min, vw, max)',
    input: '.test { font-size: 36cvpx; width: 200cvpx; }',
    expected: '.test { font-size: clamp(36px, 9.6vw, 36px); width: clamp(200px, 53.33333vw, 200px); }',
    options: {},
  },
  {
    name: 'should handle mixed vpx, maxvpx, minvpx and cvpx',
    input: '.test { margin: 10vpx 20maxvpx 15minvpx 25cvpx; }',
    expected: '.test { margin: 2.66667vw max(5.33333vw, 20px) min(4vw, 15px) clamp(25px, 6.66667vw, 25px); }',
    options: {},
  },
  {
    name: 'should handle decimal values with maxvpx and minvpx',
    input: '.test { font-size: 36.5maxvpx; line-height: 24.8minvpx; }',
    expected: '.test { font-size: max(9.73333vw, 36.5px); line-height: min(6.61333vw, 24.8px); }',
    options: {},
  },
  {
    name: 'should handle decimal values with cvpx',
    input: '.test { font-size: 36.5cvpx; }',
    expected: '.test { font-size: clamp(36.5px, 9.73333vw, 36.5px); }',
    options: {},
  },
  {
    name: 'should handle invalid maxvpx and minvpx values',
    input: '.test { font-size: maxvpx; width: abcminvpx; }',
    expected: '.test { font-size: maxvpx; width: abcminvpx; }',
    options: {},
  },
  {
    name: 'should handle invalid cvpx values',
    input: '.test { font-size: cvpx; width: abccvpx; }',
    expected: '.test { font-size: cvpx; width: abccvpx; }',
    options: {},
  },
];

// 配置选项测试
const configTests = [
  {
    name: 'should respect minPixelValue',
    input: '.test { font-size: 1vpx; width: 2vpx; }',
    expected: '.test { font-size: 1px; width: 2px; }',
    options: { minPixelValue: 2 },
  },
  {
    name: 'should respect selectorBlackList',
    input: '.ignore { font-size: 36vpx; } .test { font-size: 36vpx; }',
    expected: '.ignore { font-size: 36vpx; } .test { font-size: 9.6vw; }',
    options: { selectorBlackList: ['.ignore'] },
  },
  {
    name: 'should respect unitPrecision',
    input: '.test { font-size: 36.5vpx; }',
    expected: '.test { font-size: 9.73vw; }',
    options: { unitPrecision: 2 },
  },
  {
    name: 'should convert small vpx values to px',
    input: '.test { border: 0.5vpx solid red; margin: 1vpx; padding: 2vpx; }',
    expected: '.test { border: 0.5px solid red; margin: 1px; padding: 2px; }',
    options: { minPixelValue: 2 },
  },
  {
    name: 'should handle regex in blacklist',
    input: '.ignore-me { font-size: 36vpx; } .test { font-size: 36vpx; }',
    expected: '.ignore-me { font-size: 36vpx; } .test { font-size: 9.6vw; }',
    options: { selectorBlackList: [/ignore/] },
  },
  {
    name: 'should handle edge case with empty selector blacklist',
    input: '.test { font-size: 36vpx; }',
    expected: '.test { font-size: 9.6vw; }',
    options: { selectorBlackList: [] },
  },
  {
    name: 'should handle custom clamp ratios for cvpx',
    input: '.test { font-size: 40cvpx; }',
    expected: '.test { font-size: clamp(12px, 10.66667vw, 120px); }',
    options: { clampMinRatio: 0.3, clampMaxRatio: 3 },
  },
  {
    name: 'should respect selectorBlackList with maxvpx and minvpx',
    input: '.ignore { font-size: 36maxvpx; } .test { font-size: 36minvpx; }',
    expected: '.ignore { font-size: 36maxvpx; } .test { font-size: min(9.6vw, 36px); }',
    options: { selectorBlackList: ['.ignore'] },
  },
  {
    name: 'should respect selectorBlackList with cvpx',
    input: '.ignore { font-size: 36cvpx; } .test { font-size: 36cvpx; }',
    expected: '.ignore { font-size: 36cvpx; } .test { font-size: clamp(36px, 9.6vw, 36px); }',
    options: { selectorBlackList: ['.ignore'] },
  },
  {
    name: 'should use minRatio/maxRatio as default for clampMinRatio/clampMaxRatio',
    input: '.test { font-size: 40cvpx; }',
    expected: '.test { font-size: clamp(20px, 10.66667vw, 80px); }',
    options: { minRatio: 0.5, maxRatio: 2 },
  },
  {
    name: 'should allow explicit clampMinRatio to override minRatio',
    input: '.test { font-size: 40cvpx; }',
    expected: '.test { font-size: clamp(12px, 10.66667vw, 80px); }',
    options: { minRatio: 0.5, maxRatio: 2, clampMinRatio: 0.3 },
  },
  {
    name: 'should allow explicit clampMaxRatio to override maxRatio',
    input: '.test { font-size: 40cvpx; }',
    expected: '.test { font-size: clamp(20px, 10.66667vw, 120px); }',
    options: { minRatio: 0.5, maxRatio: 2, clampMaxRatio: 3 },
  },
  {
    name: 'should handle unitPrecision of 0',
    input: '.test { font-size: 36.5vpx; }',
    expected: '.test { font-size: 10vw; }',
    options: { unitPrecision: 0 },
  },
  {
    name: 'should handle unitPrecision of 10',
    input: '.test { font-size: 36vpx; }',
    expected: '.test { font-size: 9.6vw; }',
    options: { unitPrecision: 10 },
  },
  {
    name: 'should handle minPixelValue of 0',
    input: '.test { margin: 0.1vpx; }',
    expected: '.test { margin: 0.02667vw; }',
    options: { minPixelValue: 0 },
  },
  {
    name: 'should handle maxRatio of 0',
    input: '.test { font-size: 36maxvpx; }',
    expected: '.test { font-size: max(9.6vw, 0px); }',
    options: { maxRatio: 0 },
  },
  {
    name: 'should handle maxRatio greater than 1',
    input: '.test { font-size: 36maxvpx; }',
    expected: '.test { font-size: max(9.6vw, 72px); }',
    options: { maxRatio: 2 },
  },
];

// 负值测试
const negativeValueTests = [
  {
    name: 'should handle negative values correctly',
    input: '.test { margin: -10vpx -20maxvpx -15minvpx -25cvpx; }',
    expected: '.test { margin: -2.66667vw min(-5.33333vw, -20px) max(-4vw, -15px) clamp(-25px, -6.66667vw, -25px); }',
    options: {},
  },
  {
    name: 'should handle negative cvpx with custom ratios',
    input: '.test { margin-left: -30cvpx; }',
    expected: '.test { margin-left: clamp(-90px, -8vw, -9px); }',
    options: { clampMinRatio: 0.3, clampMaxRatio: 3 },
  },
  {
    name: 'should swap max/min semantics for negative values',
    input: '.test { margin-left: -20maxvpx; margin-right: -15minvpx; }',
    expected: '.test { margin-left: min(-5.33333vw, -20px); margin-right: max(-4vw, -15px); }',
    options: {},
  },
  {
    name: 'should maintain normal semantics for positive values',
    input: '.test { margin-left: 20maxvpx; margin-right: 15minvpx; }',
    expected: '.test { margin-left: max(5.33333vw, 20px); margin-right: min(4vw, 15px); }',
    options: {},
  },
  {
    name: 'should handle very large negative values',
    input: '.test { width: -10000vpx; }',
    expected: '.test { width: -2666.66667vw; }',
    options: {},
  },
];

// 媒体查询测试
const mediaQueryTests = [
  {
    name: 'should use different viewport width for media queries',
    input: `
      .container { width: 300vpx; }
      @media (min-width: 768px) {
        .container { width: 300vpx; }
      }
    `,
    expected: null, // 需要特殊验证 - 包含 80vw 和 39.0625vw
    options: {
      viewportWidth: 375,
      mediaQueries: {
        '@media (min-width: 768px)': {
          viewportWidth: 768,
        },
      },
    },
  },
  {
    name: 'should use different precision for different media queries',
    input: `
      .test { font-size: 16vpx; }
      @media (min-width: 768px) {
        .test { font-size: 16vpx; }
      }
    `,
    expected: null, // 包含 4.26667vw 和 2.08vw
    options: {
      viewportWidth: 375,
      unitPrecision: 5,
      mediaQueries: {
        '@media (min-width: 768px)': {
          viewportWidth: 768,
          unitPrecision: 2,
        },
      },
    },
  },
  {
    name: 'should support fuzzy matching of media queries',
    input: `
      @media screen and (min-width: 768px) {
        .test { width: 300vpx; }
      }
    `,
    expected: null, // 包含 39.1vw
    options: {
      viewportWidth: 375,
      mediaQueries: {
        'min-width: 768px': {
          viewportWidth: 768,
          unitPrecision: 1,
        },
      },
    },
  },
  {
    name: 'should respect selector blacklist in media queries',
    input: `
      .normal { width: 300vpx; }
      .ignore { width: 300vpx; }
      @media (min-width: 768px) {
        .normal { width: 300vpx; }
        .ignore { width: 300vpx; }
      }
    `,
    expected: null, // 需要验证 .ignore 保持 300vpx
    options: {
      viewportWidth: 375,
      selectorBlackList: ['.ignore'],
      mediaQueries: {
        '@media (min-width: 768px)': {
          viewportWidth: 768,
        },
      },
    },
  },
];

// CSS 变量测试
const cssVariableTests = [
  {
    name: 'should respect variableBlackList',
    input: ':root { --ignore: 36vpx; --test: 36vpx; }',
    expected: ':root { --ignore: 36vpx; --test: 9.6vw; }',
    options: { variableBlackList: ['--ignore'] },
  },
  {
    name: 'should convert CSS variables with vpx',
    input: ':root { --size: 20vpx; }',
    expected: ':root { --size: 5.33333vw; }',
    options: {},
  },
  {
    name: 'should handle CSS variables with regex in blacklist',
    input: ':root { --ignore-var: 36vpx; --test-var: 36vpx; }',
    expected: ':root { --ignore-var: 36vpx; --test-var: 9.6vw; }',
    options: { variableBlackList: [/ignore/] },
  },
  {
    name: 'should respect variable blacklist in media queries',
    input: `
      :root {
        --normal-var: 300vpx;
        --ignore-var: 300vpx;
      }
      @media (min-width: 768px) {
        :root {
          --normal-var: 300vpx;
          --ignore-var: 300vpx;
        }
      }
    `,
    expected: null, // 需要验证 --ignore-var 保持 300vpx
    options: {
      viewportWidth: 375,
      variableBlackList: ['--ignore-var'],
      mediaQueries: {
        '@media (min-width: 768px)': {
          viewportWidth: 768,
        },
      },
    },
  },
];

// 复杂选择器测试
const complexSelectorTests = [
  {
    name: 'should handle pseudo-elements',
    input: '.test::before { content: ""; width: 50vpx; }',
    expected: '.test::before { content: ""; width: 13.33333vw; }',
    options: {},
  },
  {
    name: 'should handle attribute selectors',
    input: '[data-size="large"] { padding: 30vpx; }',
    expected: '[data-size="large"] { padding: 8vw; }',
    options: {},
  },
  {
    name: 'should handle multiple selectors separated by comma',
    input: '.test, .demo, .sample { font-size: 20vpx; }',
    expected: '.test, .demo, .sample { font-size: 5.33333vw; }',
    options: {},
  },
  {
    name: 'should handle calc() expressions with vpx',
    input: '.test { width: calc(100% - 20vpx); }',
    expected: '.test { width: calc(100% - 5.33333vw); }',
    options: {},
  },
];

// linear-vpx 函数测试
const linearVpxTests = [
  {
    name: 'should convert linear-vpx with 4 parameters',
    input: '.test { width: linear-vpx(840, 1000, 1200, 1920); }',
    expected: '.test { width: clamp(840px, calc(840px + 160 * (100vw - 1200px) / 720), 1000px); }',
    options: {},
  },
  {
    name: 'should convert linear-vpx with 2 parameters',
    input: '.test { width: linear-vpx(840, 1000); }',
    expected: '.test { width: clamp(840px, calc(840px + 160 * (100vw - 1200px) / 720), 1000px); }',
    options: { linearMinWidth: 1200, linearMaxWidth: 1920 },
  },
  {
    name: 'should convert linear-vpx without clamp',
    input: '.test { width: linear-vpx(840, 1000, 1200, 1920); }',
    expected: '.test { width: calc(840px + 160 * (100vw - 1200px) / 720); }',
    options: { autoClampLinear: false },
  },
  {
    name: 'should handle negative values in linear-vpx',
    input: '.test { margin-left: linear-vpx(-100, -50, 1200, 1920); }',
    expected: '.test { margin-left: clamp(-100px, calc(-100px + 50 * (100vw - 1200px) / 720), -50px); }',
    options: {},
  },
  {
    name: 'should handle multiple linear-vpx in one declaration',
    input: '.test { padding: linear-vpx(10, 20, 768, 1920) linear-vpx(30, 50, 768, 1920); }',
    expected: '.test { padding: clamp(10px, calc(10px + 10 * (100vw - 768px) / 1152), 20px) clamp(30px, calc(30px + 20 * (100vw - 768px) / 1152), 50px); }',
    options: {},
  },
  {
    name: 'should handle linear-vpx with spaces',
    input: '.test { width: linear-vpx( 840 , 1000 , 1200 , 1920 ); }',
    expected: '.test { width: clamp(840px, calc(840px + 160 * (100vw - 1200px) / 720), 1000px); }',
    options: {},
  },
  {
    name: 'should use custom linearMinWidth and linearMaxWidth',
    input: '.test { width: linear-vpx(200, 300); }',
    expected: '.test { width: clamp(200px, calc(200px + 100 * (100vw - 768px) / 672), 300px); }',
    options: { linearMinWidth: 768, linearMaxWidth: 1440 },
  },
  {
    name: 'should respect selectorBlackList for linear-vpx',
    input: '.ignore { width: linear-vpx(840, 1000, 1200, 1920); } .test { width: linear-vpx(840, 1000, 1200, 1920); }',
    expected: '.ignore { width: linear-vpx(840, 1000, 1200, 1920); } .test { width: clamp(840px, calc(840px + 160 * (100vw - 1200px) / 720), 1000px); }',
    options: { selectorBlackList: ['.ignore'] },
  },
  {
    name: 'should handle mixed linear-vpx and vpx units',
    input: '.test { width: linear-vpx(840, 1000, 1200, 1920); height: 200vpx; margin: 10maxvpx; }',
    expected: null, // 需要验证包含所有转换
    options: {},
  },
];

// 边界情况测试
const boundaryTests = [
  {
    name: 'should handle zero vpx value',
    input: '.test { margin: 0vpx; }',
    expected: '.test { margin: 0px; }',
    options: {},
  },
  {
    name: 'should handle zero vpx with all unit types',
    input: '.test { m1: 0vpx; m2: 0maxvpx; m3: 0minvpx; m4: 0cvpx; }',
    expected: '.test { m1: 0px; m2: 0px; m3: 0px; m4: 0px; }',
    options: {},
  },
  {
    name: 'should handle very small positive values',
    input: '.test { margin: 0.01vpx; }',
    expected: '.test { margin: 0.01px; }',
    options: {},
  },
  {
    name: 'should handle very large values',
    input: '.test { width: 10000vpx; }',
    expected: '.test { width: 2666.66667vw; }',
    options: {},
  },
  {
    name: 'should handle empty CSS',
    input: '',
    expected: '',
    options: {},
  },
  {
    name: 'should handle CSS with only comments',
    input: '/* This is a comment */ .test { /* inline comment */ }',
    expected: '/* This is a comment */ .test { /* inline comment */ }',
    options: {},
  },
];

module.exports = {
  basicTests,
  unitVariantTests,
  configTests,
  negativeValueTests,
  mediaQueryTests,
  cssVariableTests,
  complexSelectorTests,
  linearVpxTests,
  boundaryTests,
};
