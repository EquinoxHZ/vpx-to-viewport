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
});
