const postcss = require('postcss');
const vpxToVw = require('./index');

describe('vpx-to-vw PostCSS Plugin', () => {
  const processCSS = (css, options = {}) => {
    return postcss([vpxToVw(options)]).process(css, { from: undefined });
  };

  test('should convert vpx to vw', async () => {
    const input = '.test { font-size: 36vpx; width: 200vpx; }';
    const expected = '.test { font-size: 9.6vw; width: 53.33333vw; }';
    const result = await processCSS(input);
    expect(result.css).toBe(expected);
  });

  test('should respect minPixelValue', async () => {
    const input = '.test { font-size: 1vpx; width: 2vpx; }';
    const expected = '.test { font-size: 1px; width: 0.53333vw; }';
    const result = await processCSS(input, { minPixelValue: 2 });
    expect(result.css).toBe(expected);
  });

  test('should respect selectorBlackList', async () => {
    const input = '.ignore { font-size: 36vpx; } .test { font-size: 36vpx; }';
    const expected = '.ignore { font-size: 36vpx; } .test { font-size: 9.6vw; }';
    const result = await processCSS(input, { selectorBlackList: ['.ignore'] });
    expect(result.css).toBe(expected);
  });

  test('should respect variableBlackList', async () => {
    const input = ':root { --ignore: 36vpx; --test: 36vpx; }';
    const expected = ':root { --ignore: 36vpx; --test: 9.6vw; }';
    const result = await processCSS(input, { variableBlackList: ['--ignore'] });
    expect(result.css).toBe(expected);
  });

  test('should handle decimal values', async () => {
    const input = '.test { font-size: 36.5vpx; }';
    const expected = '.test { font-size: 9.73333vw; }';
    const result = await processCSS(input);
    expect(result.css).toBe(expected);
  });

  test('should handle multiple vpx values in one declaration', async () => {
    const input = '.test { margin: 10vpx 20vpx; }';
    const expected = '.test { margin: 2.66667vw 5.33333vw; }';
    const result = await processCSS(input);
    expect(result.css).toBe(expected);
  });

  test('should not convert non-vpx values', async () => {
    const input = '.test { font-size: 36px; width: 200em; }';
    const expected = '.test { font-size: 36px; width: 200em; }';
    const result = await processCSS(input);
    expect(result.css).toBe(expected);
  });

  test('should handle regex in blacklist', async () => {
    const input = '.ignore-me { font-size: 36vpx; } .test { font-size: 36vpx; }';
    const expected = '.ignore-me { font-size: 36vpx; } .test { font-size: 9.6vw; }';
    const result = await processCSS(input, { selectorBlackList: [/ignore/] });
    expect(result.css).toBe(expected);
  });

  test('should handle CSS variables with regex in blacklist', async () => {
    const input = ':root { --ignore-var: 36vpx; --test-var: 36vpx; }';
    const expected = ':root { --ignore-var: 36vpx; --test-var: 9.6vw; }';
    const result = await processCSS(input, { variableBlackList: [/ignore/] });
    expect(result.css).toBe(expected);
  });

  test('should handle edge case with empty selector blacklist', async () => {
    const input = '.test { font-size: 36vpx; }';
    const expected = '.test { font-size: 9.6vw; }';
    const result = await processCSS(input, { selectorBlackList: [] });
    expect(result.css).toBe(expected);
  });

  test('should handle invalid vpx values', async () => {
    const input = '.test { font-size: vpx; width: abcvpx; }';
    const expected = '.test { font-size: vpx; width: abcvpx; }';
    const result = await processCSS(input);
    expect(result.css).toBe(expected);
  });

  test('should convert small vpx values to px', async () => {
    const input = '.test { border: 0.5vpx solid red; margin: 1vpx; padding: 2vpx; }';
    const expected = '.test { border: 0.5px solid red; margin: 1px; padding: 0.53333vw; }';
    const result = await processCSS(input, { minPixelValue: 2 });
    expect(result.css).toBe(expected);
  });
});
