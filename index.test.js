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

  test('should convert cvpx to clamp(min, vw, max)', async () => {
    const input = '.test { font-size: 36cvpx; width: 200cvpx; }';
    const expected = '.test { font-size: clamp(36px, 9.6vw, 36px); width: clamp(200px, 53.33333vw, 200px); }';
    const result = await processCSS(input);
    expect(result.css).toBe(expected);
  });

  test('should handle custom clamp ratios for cvpx', async () => {
    const input = '.test { font-size: 40cvpx; }';
    const expected = '.test { font-size: clamp(12px, 10.66667vw, 120px); }';
    const result = await processCSS(input, { clampMinRatio: 0.3, clampMaxRatio: 3 });
    expect(result.css).toBe(expected);
  });

  test('should handle decimal values with maxvpx and minvpx', async () => {
    const input = '.test { font-size: 36.5maxvpx; line-height: 24.8minvpx; }';
    const expected = '.test { font-size: max(9.73333vw, 36.5px); line-height: min(6.61333vw, 24.8px); }';
    const result = await processCSS(input);
    expect(result.css).toBe(expected);
  });

  test('should handle decimal values with cvpx', async () => {
    const input = '.test { font-size: 36.5cvpx; }';
    const expected = '.test { font-size: clamp(36.5px, 9.73333vw, 36.5px); }';
    const result = await processCSS(input);
    expect(result.css).toBe(expected);
  });

  test('should handle mixed vpx, maxvpx, minvpx and cvpx in one declaration', async () => {
    const input = '.test { margin: 10vpx 20maxvpx 15minvpx 25cvpx; }';
    const expected = '.test { margin: 2.66667vw max(5.33333vw, 20px) min(4vw, 15px) clamp(25px, 6.66667vw, 25px); }';
    const result = await processCSS(input);
    expect(result.css).toBe(expected);
  });

  test('should respect selectorBlackList with maxvpx and minvpx', async () => {
    const input = '.ignore { font-size: 36maxvpx; } .test { font-size: 36minvpx; }';
    const expected = '.ignore { font-size: 36maxvpx; } .test { font-size: min(9.6vw, 36px); }';
    const result = await processCSS(input, { selectorBlackList: ['.ignore'] });
    expect(result.css).toBe(expected);
  });

  test('should respect selectorBlackList with cvpx', async () => {
    const input = '.ignore { font-size: 36cvpx; } .test { font-size: 36cvpx; }';
    const expected = '.ignore { font-size: 36cvpx; } .test { font-size: clamp(36px, 9.6vw, 36px); }';
    const result = await processCSS(input, { selectorBlackList: ['.ignore'] });
    expect(result.css).toBe(expected);
  });

  test('should handle invalid maxvpx and minvpx values', async () => {
    const input = '.test { font-size: maxvpx; width: abcminvpx; }';
    const expected = '.test { font-size: maxvpx; width: abcminvpx; }';
    const result = await processCSS(input);
    expect(result.css).toBe(expected);
  });

  test('should handle invalid cvpx values', async () => {
    const input = '.test { font-size: cvpx; width: abccvpx; }';
    const expected = '.test { font-size: cvpx; width: abccvpx; }';
    const result = await processCSS(input);
    expect(result.css).toBe(expected);
  });

  test('should handle negative values correctly', async () => {
    const input = '.test { margin: -10vpx -20maxvpx -15minvpx -25cvpx; }';
    const expected = '.test { margin: -2.66667vw min(-5.33333vw, -20px) max(-4vw, -15px) clamp(-25px, -6.66667vw, -25px); }';
    const result = await processCSS(input);
    expect(result.css).toBe(expected);
  });

  test('should handle negative cvpx with custom ratios', async () => {
    const input = '.test { margin-left: -30cvpx; }';
    const expected = '.test { margin-left: clamp(-90px, -8vw, -9px); }';
    const result = await processCSS(input, { clampMinRatio: 0.3, clampMaxRatio: 3 });
    expect(result.css).toBe(expected);
  });

  test('should use minRatio/maxRatio as default for clampMinRatio/clampMaxRatio', async () => {
    const input = '.test { font-size: 40cvpx; }';
    const expected = '.test { font-size: clamp(20px, 10.66667vw, 80px); }';
    const result = await processCSS(input, { minRatio: 0.5, maxRatio: 2 });
    expect(result.css).toBe(expected);
  });

  test('should allow explicit clampMinRatio to override minRatio', async () => {
    const input = '.test { font-size: 40cvpx; }';
    const expected = '.test { font-size: clamp(12px, 10.66667vw, 80px); }';
    const result = await processCSS(input, { minRatio: 0.5, maxRatio: 2, clampMinRatio: 0.3 });
    expect(result.css).toBe(expected);
  });

  test('should allow explicit clampMaxRatio to override maxRatio', async () => {
    const input = '.test { font-size: 40cvpx; }';
    const expected = '.test { font-size: clamp(20px, 10.66667vw, 120px); }';
    const result = await processCSS(input, { minRatio: 0.5, maxRatio: 2, clampMaxRatio: 3 });
    expect(result.css).toBe(expected);
  });

  test('should swap max/min semantics for negative values', async () => {
    const input = '.test { margin-left: -20maxvpx; margin-right: -15minvpx; }';
    const expected = '.test { margin-left: min(-5.33333vw, -20px); margin-right: max(-4vw, -15px); }';
    const result = await processCSS(input);
    expect(result.css).toBe(expected);
  });

  test('should maintain normal semantics for positive values', async () => {
    const input = '.test { margin-left: 20maxvpx; margin-right: 15minvpx; }';
    const expected = '.test { margin-left: max(5.33333vw, 20px); margin-right: min(4vw, 15px); }';
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
      const input = '.test { font-size: 36vpx; width: 200cvpx; }';
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

    test('should log media query information when enabled', async () => {
      const input = `
        .test { width: 300vpx; }
        @media (min-width: 768px) {
          .test { width: 300vpx; }
        }
      `;
      const options = {
        viewportWidth: 375,
        logConversions: true,
        logLevel: 'verbose',
        mediaQueries: {
          '@media (min-width: 768px)': {
            viewportWidth: 768,
          },
        },
      };

      await processCSS(input, options);

      expect(consoleLogSpy).toHaveBeenCalledWith('\n[postcss-vpx-to-vw] 转换了 2 个 vpx 单位:');
      // 检查默认配置的日志
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringMatching(/.test { width: 300vpx -> 80vw }/));
      // 检查媒体查询配置的日志
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringMatching(/.test { width: 300vpx -> 39.0625vw } \[@media \(min-width: 768px\), vw:768\]/));
    });
  });

  // 媒体查询功能测试
  describe('Media Query Support', () => {
    test('should allow overriding minPixelValue inside media query', async () => {
      const input = `
        .box { border-width: 1vpx; }
        @media (min-width: 768px) {
          .box { border-width: 1vpx; }
        }
      `;
      const options = {
        viewportWidth: 375,
        minPixelValue: 2, // 顶层：1vpx 会被转换为 1px
        mediaQueries: {
          '@media (min-width: 768px)': {
            viewportWidth: 768,
            minPixelValue: 0.5, // 媒体查询覆盖：1vpx 应转换为 vw
          },
        },
      };
      const result = await processCSS(input, options);

      // 顶层：1vpx -> 1px (因为 1 <= 2)
      expect(result.css).toMatch(/\.box { border-width: 1px; }/);
      // 媒体查询内：1vpx -> (1/768*100)=0.13021vw（保持默认精度5 => 0.13021vw）
      expect(result.css).toMatch(/@media \(min-width: 768px\) {\s*\.box { border-width: 0.13021vw; }\s*}/);
    });
    test('should use different viewport width for different media queries', async () => {
      const input = `
        .container { width: 300vpx; }
        @media (min-width: 768px) {
          .container { width: 300vpx; }
        }
      `;
      const options = {
        viewportWidth: 375,
        mediaQueries: {
          '@media (min-width: 768px)': {
            viewportWidth: 768,
          },
        },
      };
      const result = await processCSS(input, options);

      // 默认配置: 300/375*100 = 80vw
      expect(result.css).toContain('width: 80vw');
      // 媒体查询配置: 300/768*100 = 39.0625vw
      expect(result.css).toContain('width: 39.0625vw');
    });

    test('should use different precision for different media queries', async () => {
      const input = `
        .test { font-size: 16vpx; }
        @media (min-width: 768px) {
          .test { font-size: 16vpx; }
        }
      `;
      const options = {
        viewportWidth: 375,
        unitPrecision: 5,
        mediaQueries: {
          '@media (min-width: 768px)': {
            viewportWidth: 768,
            unitPrecision: 2,
          },
        },
      };
      const result = await processCSS(input, options);

      // 默认精度5: 16/375*100 = 4.26667vw
      expect(result.css).toContain('font-size: 4.26667vw');
      // 媒体查询精度2: 16/768*100 = 2.08vw
      expect(result.css).toContain('font-size: 2.08vw');
    });

    test('should use different ratios for maxvpx/minvpx in media queries', async () => {
      const input = `
        .test { font-size: 16maxvpx; padding: 10minvpx; }
        @media (min-width: 768px) {
          .test { font-size: 16maxvpx; padding: 10minvpx; }
        }
      `;
      const options = {
        viewportWidth: 375,
        maxRatio: 1,
        minRatio: 1,
        mediaQueries: {
          '@media (min-width: 768px)': {
            viewportWidth: 768,
            maxRatio: 1.5,
            minRatio: 0.8,
          },
        },
      };
      const result = await processCSS(input, options);

      // 默认配置
      expect(result.css).toContain('max(4.26667vw, 16px)');
      expect(result.css).toContain('min(2.66667vw, 10px)');
      // 媒体查询配置
      expect(result.css).toContain('max(2.08333vw, 24px)'); // 16 * 1.5 = 24px
      expect(result.css).toContain('min(1.30208vw, 8px)'); // 10 * 0.8 = 8px
    });

    test('should use different clamp ratios for cvpx in media queries', async () => {
      const input = `
        .test { width: 300cvpx; }
        @media (min-width: 1024px) {
          .test { width: 300cvpx; }
        }
      `;
      const options = {
        viewportWidth: 375,
        clampMinRatio: 0.8,
        clampMaxRatio: 1.2,
        mediaQueries: {
          '@media (min-width: 1024px)': {
            viewportWidth: 1024,
            clampMinRatio: 0.6,
            clampMaxRatio: 1.8,
          },
        },
      };
      const result = await processCSS(input, options);

      // 默认配置: clamp(240px, 80vw, 360px)
      expect(result.css).toContain('clamp(240px, 80vw, 360px)');
      // 媒体查询配置: clamp(180px, 29.29688vw, 540px)
      expect(result.css).toContain('clamp(180px, 29.29688vw, 540px)');
    });

    test('should support fuzzy matching of media queries', async () => {
      const input = `
        @media screen and (min-width: 768px) {
          .test { width: 300vpx; }
        }
      `;
      const options = {
        viewportWidth: 375,
        mediaQueries: {
          'min-width: 768px': {
            viewportWidth: 768,
            unitPrecision: 1,
          },
        },
      };
      const result = await processCSS(input, options);

      // 应该匹配并使用媒体查询配置
      expect(result.css).toContain('width: 39.1vw'); // 300/768*100 = 39.0625 -> 39.1 (精度1)
    });

    test('should respect selector blacklist in media queries', async () => {
      const input = `
        .normal { width: 300vpx; }
        .ignore { width: 300vpx; }
        @media (min-width: 768px) {
          .normal { width: 300vpx; }
          .ignore { width: 300vpx; }
        }
      `;
      const options = {
        viewportWidth: 375,
        selectorBlackList: ['.ignore'],
        mediaQueries: {
          '@media (min-width: 768px)': {
            viewportWidth: 768,
          },
        },
      };
      const result = await processCSS(input, options);

      // 正常的选择器应该被转换
      expect(result.css).toContain('.normal { width: 80vw; }');
      expect(result.css).toContain('.normal { width: 39.0625vw; }');
      // 黑名单中的选择器应该保持不变
      expect(result.css).toContain('.ignore { width: 300vpx; }');
    });

    test('should respect variable blacklist in media queries', async () => {
      const input = `
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
      `;
      const options = {
        viewportWidth: 375,
        variableBlackList: ['--ignore-var'],
        mediaQueries: {
          '@media (min-width: 768px)': {
            viewportWidth: 768,
          },
        },
      };
      const result = await processCSS(input, options);

      // 正常的变量应该被转换
      expect(result.css).toContain('--normal-var: 80vw;');
      expect(result.css).toContain('--normal-var: 39.0625vw;');
      // 黑名单中的变量应该保持不变
      expect(result.css).toContain('--ignore-var: 300vpx;');
    });

    test('should handle nested media queries correctly', async () => {
      const input = `
        .outer { width: 100vpx; }
        @media (min-width: 768px) {
          .inner { height: 200vpx; }
          @media (orientation: landscape) {
            .nested { padding: 50vpx; }
          }
        }
      `;
      const options = {
        viewportWidth: 375,
        mediaQueries: {
          '@media (min-width: 768px)': {
            viewportWidth: 768,
          },
        },
      };
      const result = await processCSS(input, options);

      // 外层使用默认配置
      expect(result.css).toContain('.outer { width: 26.66667vw; }');
      // 内层使用媒体查询配置
      expect(result.css).toContain('.inner { height: 26.04167vw; }');
      // 嵌套的内层使用默认配置（因为没有配置嵌套的媒体查询）
      expect(result.css).toContain('.nested { padding: 13.33333vw; }');
    });

    test('should handle multiple media query configurations', async () => {
      const input = `
        .test { width: 300vpx; }
        @media (max-width: 480px) {
          .test { width: 250vpx; }
        }
        @media (min-width: 768px) {
          .test { width: 400vpx; }
        }
      `;
      const options = {
        viewportWidth: 375,
        unitPrecision: 3,
        mediaQueries: {
          '@media (max-width: 480px)': {
            viewportWidth: 320,
            unitPrecision: 4,
          },
          '@media (min-width: 768px)': {
            viewportWidth: 768,
            unitPrecision: 2,
          },
        },
      };
      const result = await processCSS(input, options);

      // 默认配置
      expect(result.css).toContain('.test { width: 80vw; }');
      // 小屏配置
      expect(result.css).toContain('width: 78.125vw'); // 250/320*100 = 78.125 (精度4)
      // 大屏配置
      expect(result.css).toContain('width: 52.08vw'); // 400/768*100 = 52.083... -> 52.08 (精度2)
    });
  });

  // 线性缩放功能测试
  describe('linear-vpx function', () => {
    test('should convert linear-vpx with 4 parameters to clamp + calc by default', async () => {
      const input = '.test { width: linear-vpx(840, 1000, 1200, 1920); }';
      const expected = '.test { width: clamp(840px, calc(840px + 160 * (100vw - 1200px) / 720), 1000px); }';
      const result = await processCSS(input);
      expect(result.css).toBe(expected);
    });

    test('should convert linear-vpx with 2 parameters using default viewport range', async () => {
      const input = '.test { width: linear-vpx(840, 1000); }';
      const expected = '.test { width: clamp(840px, calc(840px + 160 * (100vw - 1200px) / 720), 1000px); }';
      const result = await processCSS(input, { linearMinWidth: 1200, linearMaxWidth: 1920 });
      expect(result.css).toBe(expected);
    });

    test('should convert linear-vpx without clamp when autoClampLinear is false', async () => {
      const input = '.test { width: linear-vpx(840, 1000, 1200, 1920); }';
      const expected = '.test { width: calc(840px + 160 * (100vw - 1200px) / 720); }';
      const result = await processCSS(input, { autoClampLinear: false });
      expect(result.css).toBe(expected);
    });

    test('should handle decimal values in linear-vpx', async () => {
      const input = '.test { width: linear-vpx(840.5, 1000.8, 1200, 1920); }';
      const result = await processCSS(input);
      // 验证包含关键部分，允许浮点数精度差异
      expect(result.css).toContain('clamp(840.5px, calc(840.5px + ');
      expect(result.css).toContain('* (100vw - 1200px) / 720), 1000.8px)');
    });

    test('should handle negative values in linear-vpx', async () => {
      const input = '.test { margin-left: linear-vpx(-100, -50, 1200, 1920); }';
      const expected = '.test { margin-left: clamp(-100px, calc(-100px + 50 * (100vw - 1200px) / 720), -50px); }';
      const result = await processCSS(input);
      expect(result.css).toBe(expected);
    });

    test('should handle multiple linear-vpx in one declaration', async () => {
      const input = '.test { padding: linear-vpx(10, 20, 768, 1920) linear-vpx(30, 50, 768, 1920); }';
      const expected = '.test { padding: clamp(10px, calc(10px + 10 * (100vw - 768px) / 1152), 20px) clamp(30px, calc(30px + 20 * (100vw - 768px) / 1152), 50px); }';
      const result = await processCSS(input);
      expect(result.css).toBe(expected);
    });

    test('should handle linear-vpx with spaces in parameters', async () => {
      const input = '.test { width: linear-vpx( 840 , 1000 , 1200 , 1920 ); }';
      const expected = '.test { width: clamp(840px, calc(840px + 160 * (100vw - 1200px) / 720), 1000px); }';
      const result = await processCSS(input);
      expect(result.css).toBe(expected);
    });

    test('should use custom linearMinWidth and linearMaxWidth for 2-parameter form', async () => {
      const input = '.test { width: linear-vpx(200, 300); }';
      const expected = '.test { width: clamp(200px, calc(200px + 100 * (100vw - 768px) / 672), 300px); }';
      const result = await processCSS(input, { linearMinWidth: 768, linearMaxWidth: 1440 });
      expect(result.css).toBe(expected);
    });

    test('should handle linear-vpx in media queries with custom config', async () => {
      const input = `
        .test { width: linear-vpx(100, 200); }
        @media (min-width: 768px) {
          .test { width: linear-vpx(300, 500); }
        }
      `;
      const options = {
        linearMinWidth: 375,
        linearMaxWidth: 1920,
        mediaQueries: {
          '@media (min-width: 768px)': {
            linearMinWidth: 768,
            linearMaxWidth: 1440,
          },
        },
      };
      const result = await processCSS(input, options);

      // 默认配置
      expect(result.css).toContain('width: clamp(100px, calc(100px + 100 * (100vw - 375px) / 1545), 200px)');
      // 媒体查询配置
      expect(result.css).toContain('width: clamp(300px, calc(300px + 200 * (100vw - 768px) / 672), 500px)');
    });

    test('should handle linear-vpx with autoClampLinear disabled in media queries', async () => {
      const input = `
        @media (min-width: 768px) {
          .test { width: linear-vpx(300, 500, 768, 1440); }
        }
      `;
      const options = {
        autoClampLinear: true,
        mediaQueries: {
          '@media (min-width: 768px)': {
            autoClampLinear: false,
          },
        },
      };
      const result = await processCSS(input, options);
      expect(result.css).toContain('width: calc(300px + 200 * (100vw - 768px) / 672)');
      expect(result.css).not.toContain('clamp');
    });

    test('should handle mixed linear-vpx and vpx units', async () => {
      const input = '.test { width: linear-vpx(840, 1000, 1200, 1920); height: 200vpx; margin: 10maxvpx; }';
      const result = await processCSS(input);
      expect(result.css).toContain('width: clamp(840px, calc(840px + 160 * (100vw - 1200px) / 720), 1000px)');
      expect(result.css).toContain('height: 53.33333vw');
      expect(result.css).toContain('margin: max(2.66667vw, 10px)');
    });

    test('should respect selectorBlackList for linear-vpx', async () => {
      const input = '.ignore { width: linear-vpx(840, 1000, 1200, 1920); } .test { width: linear-vpx(840, 1000, 1200, 1920); }';
      const result = await processCSS(input, { selectorBlackList: ['.ignore'] });
      // .ignore 应该不被转换
      expect(result.css).toContain('.ignore { width: linear-vpx(840, 1000, 1200, 1920); }');
      // .test 应该被转换
      expect(result.css).toContain('.test { width: clamp(840px, calc(840px + 160 * (100vw - 1200px) / 720), 1000px); }');
    });

    test('should respect variableBlackList for linear-vpx', async () => {
      const input = ':root { --ignore: linear-vpx(840, 1000, 1200, 1920); --test: linear-vpx(840, 1000, 1200, 1920); }';
      const result = await processCSS(input, { variableBlackList: ['--ignore'] });
      // --ignore 应该不被转换
      expect(result.css).toContain('--ignore: linear-vpx(840, 1000, 1200, 1920)');
      // --test 应该被转换
      expect(result.css).toContain('--test: clamp(840px, calc(840px + 160 * (100vw - 1200px) / 720), 1000px)');
    });

    test('should log linear-vpx conversions when enabled', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const input = '.test { width: linear-vpx(840, 1000, 1200, 1920); }';
      await processCSS(input, { logConversions: true, logLevel: 'verbose' });

      expect(consoleLogSpy).toHaveBeenCalledWith('\n[postcss-vpx-to-vw] 转换了 1 个 vpx 单位:');
      consoleLogSpy.mockRestore();
    });

    test('should handle edge case with same min and max values', async () => {
      const input = '.test { width: linear-vpx(500, 500, 1200, 1920); }';
      const expected = '.test { width: clamp(500px, calc(500px + 0 * (100vw - 1200px) / 720), 500px); }';
      const result = await processCSS(input);
      expect(result.css).toBe(expected);
    });

    test('should handle very large viewport ranges', async () => {
      const input = '.test { width: linear-vpx(100, 500, 320, 3840); }';
      const expected = '.test { width: clamp(100px, calc(100px + 400 * (100vw - 320px) / 3520), 500px); }';
      const result = await processCSS(input);
      expect(result.css).toBe(expected);
    });

    test('should handle small decimal differences', async () => {
      const input = '.test { width: linear-vpx(16.5, 18.2, 375, 768); }';
      const result = await processCSS(input);
      // 验证包含关键部分，允许浮点数精度差异
      expect(result.css).toContain('clamp(16.5px, calc(16.5px + ');
      expect(result.css).toContain('* (100vw - 375px) / 393), 18.2px)');
    });
  });

  // 边界情况和参数验证测试
  describe('Boundary Cases and Parameter Validation', () => {
    test('should handle zero vpx value', async () => {
      const input = '.test { margin: 0vpx; }';
      const expected = '.test { margin: 0px; }'; // 0 <= minPixelValue (1)，转换为 px
      const result = await processCSS(input);
      expect(result.css).toBe(expected);
    });

    test('should handle zero vpx with all unit types', async () => {
      const input = '.test { m1: 0vpx; m2: 0maxvpx; m3: 0minvpx; m4: 0cvpx; }';
      const expected = '.test { m1: 0px; m2: 0px; m3: 0px; m4: 0px; }'; // 所有都小于等于 minPixelValue
      const result = await processCSS(input);
      expect(result.css).toBe(expected);
    });

    test('should handle very small positive values', async () => {
      const input = '.test { margin: 0.01vpx; }';
      const expected = '.test { margin: 0.01px; }'; // 0.01 <= minPixelValue (1)，转换为 px
      const result = await processCSS(input);
      expect(result.css).toBe(expected);
    });

    test('should handle very small negative values', async () => {
      const input = '.test { margin: -0.01vpx; }';
      // 设置 minPixelValue 为 0，将小值转换为 vw
      const result = await processCSS(input, { minPixelValue: 0 });
      expect(result.css).toContain('-0.00267vw');
    });

    test('should handle very large values', async () => {
      const input = '.test { width: 10000vpx; }';
      const expected = '.test { width: 2666.66667vw; }';
      const result = await processCSS(input);
      expect(result.css).toBe(expected);
    });

    test('should handle very large negative values', async () => {
      const input = '.test { width: -10000vpx; }';
      const expected = '.test { width: -2666.66667vw; }';
      const result = await processCSS(input);
      expect(result.css).toBe(expected);
    });

    test('should handle high precision values', async () => {
      const input = '.test { font-size: 36.123456789vpx; }';
      // 使用默认精度 5
      const expected = '.test { font-size: 9.63292vw; }';
      const result = await processCSS(input);
      expect(result.css).toBe(expected);
    });

    test('should handle unitPrecision of 0', async () => {
      const input = '.test { font-size: 36.5vpx; }';
      const expected = '.test { font-size: 10vw; }'; // 四舍五入到整数
      const result = await processCSS(input, { unitPrecision: 0 });
      expect(result.css).toBe(expected);
    });

    test('should handle unitPrecision of 10 (very high precision)', async () => {
      const input = '.test { font-size: 36vpx; }';
      const result = await processCSS(input, { unitPrecision: 10 });
      // 36/375*100 = 9.6 exactly
      expect(result.css).toContain('9.6vw');
    });

    test('should handle minPixelValue of 0', async () => {
      const input = '.test { margin: 0.1vpx; }';
      const result = await processCSS(input, { minPixelValue: 0 });
      // 应转换为 vw 而不是 px
      expect(result.css).not.toContain('0.1px');
      expect(result.css).toContain('0.02667vw');
      expect(result.css).toContain('vw');
    });

    test('should handle minPixelValue equal to value', async () => {
      const input = '.test { margin: 2vpx; }';
      // 当值等于 minPixelValue 时，应转换为 px
      const expected = '.test { margin: 2px; }';
      const result = await processCSS(input, { minPixelValue: 2 });
      expect(result.css).toBe(expected);
    });

    test('should handle maxRatio of 0', async () => {
      const input = '.test { font-size: 36maxvpx; }';
      const expected = '.test { font-size: max(9.6vw, 0px); }';
      const result = await processCSS(input, { maxRatio: 0 });
      expect(result.css).toBe(expected);
    });

    test('should handle maxRatio greater than 1', async () => {
      const input = '.test { font-size: 36maxvpx; }';
      const expected = '.test { font-size: max(9.6vw, 72px); }';
      const result = await processCSS(input, { maxRatio: 2 });
      expect(result.css).toBe(expected);
    });

    test('should handle minRatio of 0', async () => {
      const input = '.test { font-size: 36minvpx; }';
      const expected = '.test { font-size: min(9.6vw, 0px); }';
      const result = await processCSS(input, { minRatio: 0 });
      expect(result.css).toBe(expected);
    });

    test('should handle clampMinRatio less than clampMaxRatio', async () => {
      const input = '.test { font-size: 40cvpx; }';
      const expected = '.test { font-size: clamp(10px, 10.66667vw, 80px); }';
      const result = await processCSS(input, { clampMinRatio: 0.25, clampMaxRatio: 2 });
      expect(result.css).toBe(expected);
    });

    test('should handle clampMinRatio equal to clampMaxRatio', async () => {
      const input = '.test { font-size: 40cvpx; }';
      const expected = '.test { font-size: clamp(40px, 10.66667vw, 40px); }';
      const result = await processCSS(input, { clampMinRatio: 1, clampMaxRatio: 1 });
      expect(result.css).toBe(expected);
    });

    test('should handle clampMinRatio greater than clampMaxRatio', async () => {
      // 逆序的 clamp 应该正确处理
      const input = '.test { font-size: -40cvpx; }';
      const result = await processCSS(input, { clampMinRatio: 2, clampMaxRatio: 0.5 });
      // 对于负数，min 和 max 会交换，所以逆序的比例也会交换
      expect(result.css).toContain('clamp');
    });

    test('should handle viewportWidth at boundary (very small)', async () => {
      const input = '.test { width: 100vpx; }';
      const expected = '.test { width: 1000vw; }'; // 100 / 10 * 100 = 1000
      const result = await processCSS(input, { viewportWidth: 10 });
      expect(result.css).toBe(expected);
    });

    test('should handle viewportWidth at boundary (very large)', async () => {
      const input = '.test { width: 100vpx; }';
      const expected = '.test { width: 1vw; }'; // 100 / 10000 * 100 = 1
      const result = await processCSS(input, { viewportWidth: 10000 });
      expect(result.css).toBe(expected);
    });

    test('should handle multiple values where some need px conversion', async () => {
      const input = '.test { margin: 0.5vpx 10vpx 1vpx 20vpx; }';
      const expected = '.test { margin: 0.5px 2.66667vw 1px 5.33333vw; }';
      const result = await processCSS(input, { minPixelValue: 1 });
      expect(result.css).toBe(expected);
    });

    test('should handle nested selectors with vpx', async () => {
      const input = `.parent {
        .child { font-size: 20vpx; }
      }`;
      const result = await processCSS(input);
      expect(result.css).toContain('5.33333vw');
    });

    test('should handle pseudo-elements with vpx', async () => {
      const input = `.test::before { content: ""; width: 50vpx; }`;
      const result = await processCSS(input);
      expect(result.css).toContain('13.33333vw');
    });

    test('should handle attribute selectors with vpx', async () => {
      const input = `[data-size="large"] { padding: 30vpx; }`;
      const result = await processCSS(input);
      expect(result.css).toContain('8vw');
    });

    test('should handle multiple declarations in one rule', async () => {
      const input = `.test {
        font-size: 16vpx;
        line-height: 1.5;
        margin: 10vpx;
        padding: 20vpx;
        border-width: 1vpx;
      }`;
      const result = await processCSS(input);
      expect(result.css).toContain('font-size: 4.26667vw');
      expect(result.css).toContain('margin: 2.66667vw');
      expect(result.css).toContain('padding: 5.33333vw');
      expect(result.css).toContain('border-width: 1px'); // <= minPixelValue default 1
    });

    test('should throw error for viewportWidth <= 0', () => {
      expect(() => {
        vpxToVw({ viewportWidth: 0 });
      }).toThrow('[postcss-vpx-to-vw] viewportWidth 必须大于 0');
    });

    test('should throw error for viewportWidth < 0', () => {
      expect(() => {
        vpxToVw({ viewportWidth: -100 });
      }).toThrow('[postcss-vpx-to-vw] viewportWidth 必须大于 0');
    });

    test('should throw error for negative unitPrecision', () => {
      expect(() => {
        vpxToVw({ unitPrecision: -1 });
      }).toThrow('[postcss-vpx-to-vw] unitPrecision 必须为非负整数');
    });

    test('should throw error for non-integer unitPrecision', () => {
      expect(() => {
        vpxToVw({ unitPrecision: 2.5 });
      }).toThrow('[postcss-vpx-to-vw] unitPrecision 必须为非负整数');
    });

    test('should throw error for negative minPixelValue', () => {
      expect(() => {
        vpxToVw({ minPixelValue: -1 });
      }).toThrow('[postcss-vpx-to-vw] minPixelValue 不能为负数');
    });

    test('should throw error for linearMinWidth >= linearMaxWidth', () => {
      expect(() => {
        vpxToVw({ linearMinWidth: 1000, linearMaxWidth: 800 });
      }).toThrow('[postcss-vpx-to-vw] linearMinWidth 必须小于 linearMaxWidth');
    });

    test('should throw error for linearMinWidth === linearMaxWidth', () => {
      expect(() => {
        vpxToVw({ linearMinWidth: 1000, linearMaxWidth: 1000 });
      }).toThrow('[postcss-vpx-to-vw] linearMinWidth 必须小于 linearMaxWidth');
    });

    test('should throw error for invalid logLevel', () => {
      expect(() => {
        vpxToVw({ logLevel: 'debug' });
      }).toThrow('[postcss-vpx-to-vw] 无效的 logLevel');
    });

    test('should handle empty CSS', async () => {
      const input = '';
      const expected = '';
      const result = await processCSS(input);
      expect(result.css).toBe(expected);
    });

    test('should handle CSS with only comments', async () => {
      const input = '/* This is a comment */ .test { /* inline comment */ }';
      const expected = '/* This is a comment */ .test { /* inline comment */ }';
      const result = await processCSS(input);
      expect(result.css).toBe(expected);
    });

    test('should handle multiple selectors separated by comma', async () => {
      const input = '.test, .demo, .sample { font-size: 20vpx; }';
      const result = await processCSS(input);
      // CSS 中多个选择器指向同一规则，字体大小只出现一次
      expect(result.css).toContain('5.33333vw');
    });

    test('should handle at-rules like @supports', async () => {
      const input = `@supports (display: grid) {
        .grid { width: 50vpx; }
      }`;
      const result = await processCSS(input);
      expect(result.css).toContain('13.33333vw');
    });

    test('should handle keyframes animation', async () => {
      const input = `@keyframes slide {
        from { left: 0vpx; }
        to { left: 100vpx; }
      }`;
      const result = await processCSS(input);
      // 0vpx 会被转换为 0px 而不是 0vw（因为 minPixelValue 默认为 1）
      expect(result.css).toContain('0px');
      expect(result.css).toContain('26.66667vw');
    });

    test('should handle font-face rules', async () => {
      const input = `@font-face {
        font-family: 'Custom';
        src: url('font.woff');
      }
      .text { font-size: 24vpx; }`;
      const result = await processCSS(input);
      expect(result.css).toContain('6.4vw');
    });

    test('should handle calc() expressions with vpx', async () => {
      const input = '.test { width: calc(100% - 20vpx); }';
      const result = await processCSS(input);
      // calc 内的 vpx 应该被转换
      expect(result.css).toContain('calc(100% - 5.33333vw)');
    });

    test('should handle var() CSS custom properties with vpx', async () => {
      const input = `.test {
        --size: 20vpx;
        width: var(--size);
      }`;
      const result = await processCSS(input);
      // CSS 变量声明应被转换
      expect(result.css).toContain('--size: 5.33333vw');
    });

    test('should handle function-like values (not CSS functions)', async () => {
      const input = '.test { content: "20vpx"; }';
      const result = await processCSS(input);
      // PostCSS 会转换所有 vpx 单位，包括字符串内的（这是当前的实现行为）
      expect(result.css).toContain('5.33333vw');
    });

    test('should handle maxvpx with ratio of 0.5', async () => {
      const input = '.test { font-size: 40maxvpx; }';
      const expected = '.test { font-size: max(10.66667vw, 20px); }';
      const result = await processCSS(input, { maxRatio: 0.5 });
      expect(result.css).toBe(expected);
    });

    test('should handle minvpx with ratio of 0.5', async () => {
      const input = '.test { font-size: 40minvpx; }';
      const expected = '.test { font-size: min(10.66667vw, 20px); }';
      const result = await processCSS(input, { minRatio: 0.5 });
      expect(result.css).toBe(expected);
    });

    test('should handle negative maxvpx with positive ratio', async () => {
      const input = '.test { margin: -50maxvpx; }';
      const expected = '.test { margin: min(-13.33333vw, -50px); }';
      const result = await processCSS(input, { maxRatio: 1 });
      expect(result.css).toBe(expected);
    });

    test('should handle negative minvpx with positive ratio', async () => {
      const input = '.test { margin: -50minvpx; }';
      const expected = '.test { margin: max(-13.33333vw, -50px); }';
      const result = await processCSS(input, { minRatio: 1 });
      expect(result.css).toBe(expected);
    });

    test('should handle linear-vpx with negative minVal and maxVal', async () => {
      const input = '.test { width: linear-vpx(-100, -50); }';
      const result = await processCSS(input);
      expect(result.css).toContain('clamp(-100px');
      expect(result.css).toContain('-50px)');
    });

    test('should handle linear-vpx with same minVal and maxVal', async () => {
      const input = '.test { width: linear-vpx(50, 50); }';
      const result = await processCSS(input);
      // 当 min === max 时，差值为 0，calc 表达式中乘以 0
      expect(result.css).toContain('clamp(50px, calc(50px + 0 * ');
    });
  });
});
