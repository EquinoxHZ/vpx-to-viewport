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
    const expected = '.test { font-size: 1px; width: 2px; }';
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
    const expected = '.test { border: 0.5px solid red; margin: 1px; padding: 2px; }';
    const result = await processCSS(input, { minPixelValue: 2 });
    expect(result.css).toBe(expected);
  });

  test('should convert maxvpx to max(vw, Npx)', async () => {
    const input = '.test { font-size: 36maxvpx; width: 200maxvpx; }';
    const expected = '.test { font-size: max(9.6vw, 36px); width: max(53.33333vw, 200px); }';
    const result = await processCSS(input);
    expect(result.css).toBe(expected);
  });

  test('should convert minvpx to min(vw, Npx)', async () => {
    const input = '.test { font-size: 36minvpx; width: 200minvpx; }';
    const expected = '.test { font-size: min(9.6vw, 36px); width: min(53.33333vw, 200px); }';
    const result = await processCSS(input);
    expect(result.css).toBe(expected);
  });

  test('should handle decimal values with maxvpx and minvpx', async () => {
    const input = '.test { font-size: 36.5maxvpx; line-height: 24.8minvpx; }';
    const expected = '.test { font-size: max(9.73333vw, 36.5px); line-height: min(6.61333vw, 24.8px); }';
    const result = await processCSS(input);
    expect(result.css).toBe(expected);
  });

  test('should handle mixed vpx, maxvpx and minvpx in one declaration', async () => {
    const input = '.test { margin: 10vpx 20maxvpx 15minvpx 25vpx; }';
    const expected = '.test { margin: 2.66667vw max(5.33333vw, 20px) min(4vw, 15px) 6.66667vw; }';
    const result = await processCSS(input);
    expect(result.css).toBe(expected);
  });

  test('should respect selectorBlackList with maxvpx and minvpx', async () => {
    const input = '.ignore { font-size: 36maxvpx; } .test { font-size: 36minvpx; }';
    const expected = '.ignore { font-size: 36maxvpx; } .test { font-size: min(9.6vw, 36px); }';
    const result = await processCSS(input, { selectorBlackList: ['.ignore'] });
    expect(result.css).toBe(expected);
  });

  test('should handle invalid maxvpx and minvpx values', async () => {
    const input = '.test { font-size: maxvpx; width: abcminvpx; }';
    const expected = '.test { font-size: maxvpx; width: abcminvpx; }';
    const result = await processCSS(input);
    expect(result.css).toBe(expected);
  });

  // 转换日志功能测试
  describe('conversion logging', () => {
    let consoleLogSpy;

    beforeEach(() => {
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
    });

    test('should not log when logConversions is false', async () => {
      const input = '.test { font-size: 36vpx; width: 200vpx; }';
      await processCSS(input, { logConversions: false });
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    test('should log conversion summary in info level', async () => {
      const input = '.test { font-size: 36vpx; width: 200vpx; }';
      await processCSS(input, { logConversions: true, logLevel: 'info' });

      expect(consoleLogSpy).toHaveBeenCalledWith('\n[postcss-vpx-to-vw] 转换了 2 个 vpx 单位:');
      // 检查是否有文件统计日志（文件名会是动态生成的）
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringMatching(/: 2 个转换$/));
    });

    test('should log detailed conversion info in verbose level', async () => {
      const input = '.test { font-size: 36vpx; width: 200vpx; }';
      await processCSS(input, { logConversions: true, logLevel: 'verbose' });

      expect(consoleLogSpy).toHaveBeenCalledWith('\n[postcss-vpx-to-vw] 转换了 2 个 vpx 单位:');
      // 检查是否有详细的转换日志（文件名和行号会是动态的）
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringMatching(/.test { font-size: 36vpx -> 9.6vw }/));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringMatching(/.test { width: 200vpx -> 53.33333vw }/));
    });

    test('should not log when no conversions occur', async () => {
      const input = '.test { font-size: 36px; width: 200px; }';
      await processCSS(input, { logConversions: true, logLevel: 'info' });
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    test('should log conversions for maxvpx and minvpx', async () => {
      const input = '.test { font-size: 36maxvpx; width: 200minvpx; }';
      await processCSS(input, { logConversions: true, logLevel: 'verbose' });

      expect(consoleLogSpy).toHaveBeenCalledWith('\n[postcss-vpx-to-vw] 转换了 2 个 vpx 单位:');
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringMatching(/.test { font-size: 36maxvpx -> max\(9.6vw, 36px\) }/));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringMatching(/.test { width: 200minvpx -> min\(53.33333vw, 200px\) }/));
    });

    test('should log CSS variable conversions', async () => {
      const input = ':root { --test-var: 36vpx; }';
      await processCSS(input, { logConversions: true, logLevel: 'verbose' });

      expect(consoleLogSpy).toHaveBeenCalledWith('\n[postcss-vpx-to-vw] 转换了 1 个 vpx 单位:');
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringMatching(/:root { --test-var: 36vpx -> 9.6vw }/));
    });

    test('should respect silent log level', async () => {
      const input = '.test { font-size: 36vpx; width: 200vpx; }';
      await processCSS(input, { logConversions: true, logLevel: 'silent' });
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    test('should group conversions by file in info level', async () => {
      const input1 = '.test1 { font-size: 36vpx; }';
      const input2 = '.test2 { width: 200vpx; }';

      // 模拟不同文件的处理
      await processCSS(input1, { logConversions: true, logLevel: 'info' });
      await processCSS(input2, { logConversions: true, logLevel: 'info' });

      // 每次处理都会产生独立的日志
      expect(consoleLogSpy).toHaveBeenCalledWith('\n[postcss-vpx-to-vw] 转换了 1 个 vpx 单位:');
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringMatching(/: 1 个转换$/));
    });
  });
});
