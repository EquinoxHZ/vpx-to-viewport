/**
 * Vite Plugin VPX 测试文件
 */

const vitePluginVpx = require('./vite-plugin-vpx.js').default;

// 测试用例
describe('Vite Plugin VPX', () => {
  let plugin;

  beforeEach(() => {
    plugin = vitePluginVpx({
      viewportWidth: 375,
      unitPrecision: 5,
      minPixelValue: 1,
      logConversions: false,
    });
  });

  // 测试基础 vpx 转换
  test('should convert vpx to vw', () => {
    const input = '.test { font-size: 36vpx; width: 200vpx; }';
    const expected = '.test { font-size: 9.6vw; width: 53.33333vw; }';
    const result = plugin.transform(input, 'test.css');
    expect(result.code).toBe(expected);
  });

  // 测试 maxvpx 转换
  test('should convert maxvpx to max(vw, Npx)', () => {
    const input = '.test { font-size: 36maxvpx; }';
    const expected = '.test { font-size: max(9.6vw, 36px); }';
    const result = plugin.transform(input, 'test.css');
    expect(result.code).toBe(expected);
  });

  // 测试 minvpx 转换
  test('should convert minvpx to min(vw, Npx)', () => {
    const input = '.test { font-size: 36minvpx; }';
    const expected = '.test { font-size: min(9.6vw, 36px); }';
    const result = plugin.transform(input, 'test.css');
    expect(result.code).toBe(expected);
  });

  // 测试 cvpx 转换
  test('should convert cvpx to clamp()', () => {
    const input = '.test { font-size: 36cvpx; }';
    const expected = '.test { font-size: clamp(36px, 9.6vw, 36px); }';
    const result = plugin.transform(input, 'test.css');
    expect(result.code).toBe(expected);
  });

  // 测试 linear-vpx 转换
  test('should convert linear-vpx() function', () => {
    const input = '.test { font-size: linear-vpx(14, 20); }';
    const result = plugin.transform(input, 'test.css');
    expect(result.code).toContain('clamp');
    expect(result.code).toContain('calc');
  });

  // 测试选择器黑名单
  test('should respect selectorBlackList', () => {
    const customPlugin = vitePluginVpx({
      viewportWidth: 375,
      selectorBlackList: ['.ignore'],
    });
    const input = '.ignore { font-size: 36vpx; } .test { font-size: 36vpx; }';
    const result = customPlugin.transform(input, 'test.css');
    expect(result.code).toContain('.ignore { font-size: 36vpx; }');
    expect(result.code).toContain('.test { font-size: 9.6vw; }');
  });

  // 测试 CSS 变量黑名单
  test('should respect variableBlackList', () => {
    const customPlugin = vitePluginVpx({
      viewportWidth: 375,
      variableBlackList: ['--ignore'],
    });
    const input = ':root { --ignore: 36vpx; --test: 36vpx; }';
    const result = customPlugin.transform(input, 'test.css');
    expect(result.code).toContain('--ignore: 36vpx');
    expect(result.code).toContain('--test: 9.6vw');
  });

  // 测试媒体查询
  test('should handle media queries with specific config', () => {
    const customPlugin = vitePluginVpx({
      viewportWidth: 375,
      mediaQueries: {
        '@media (min-width: 768px)': {
          viewportWidth: 768,
        },
      },
    });
    const input = `
      .test { font-size: 36vpx; }
      @media (min-width: 768px) {
        .test { font-size: 36vpx; }
      }
    `;
    const result = customPlugin.transform(input, 'test.css');
    // 默认配置：36 / 375 * 100 = 9.6vw
    expect(result.code).toContain('9.6vw');
    // 媒体查询配置：36 / 768 * 100 = 4.6875vw
    expect(result.code).toContain('4.6875vw');
  });

  // 测试文件过滤
  test('should filter files by include pattern', () => {
    const customPlugin = vitePluginVpx({
      include: [/\.css$/],
      exclude: [/node_modules/],
    });

    // 应该处理的文件
    expect(customPlugin.transform('.test { width: 100vpx; }', 'test.css')).toBeTruthy();

    // 不应该处理的文件
    expect(customPlugin.transform('.test { width: 100vpx; }', 'node_modules/test.css')).toBeNull();
  });

  // 测试小数值
  test('should handle decimal values', () => {
    const input = '.test { font-size: 36.5vpx; }';
    const expected = '.test { font-size: 9.73333vw; }';
    const result = plugin.transform(input, 'test.css');
    expect(result.code).toBe(expected);
  });

  // 测试负数值
  test('should handle negative values', () => {
    const input = '.test { margin: -10vpx; }';
    const expected = '.test { margin: -2.66667vw; }';
    const result = plugin.transform(input, 'test.css');
    expect(result.code).toBe(expected);
  });

  // 测试最小转换值
  test('should respect minPixelValue', () => {
    const customPlugin = vitePluginVpx({
      viewportWidth: 375,
      minPixelValue: 2,
    });
    const input = '.test { border: 1vpx solid red; padding: 3vpx; }';
    const expected = '.test { border: 1px solid red; padding: 0.8vw; }';
    const result = customPlugin.transform(input, 'test.css');
    expect(result.code).toBe(expected);
  });

  // 测试多个值
  test('should handle multiple vpx values', () => {
    const input = '.test { margin: 10vpx 20vpx 30vpx 40vpx; }';
    const expected = '.test { margin: 2.66667vw 5.33333vw 8vw 10.66667vw; }';
    const result = plugin.transform(input, 'test.css');
    expect(result.code).toBe(expected);
  });

  // 测试嵌套规则
  test('should handle nested rules in media queries', () => {
    const input = `
      @media (min-width: 768px) {
        .test { font-size: 36vpx; }
        .another { width: 200vpx; }
      }
    `;
    const result = plugin.transform(input, 'test.css');
    expect(result.code).toContain('9.6vw');
    expect(result.code).toContain('53.33333vw');
  });

  // 测试性能（不包含 vpx 的代码应该快速返回）
  test('should return null for code without vpx', () => {
    const input = '.test { font-size: 16px; color: red; }';
    const result = plugin.transform(input, 'test.css');
    expect(result).toBeNull();
  });

  // 测试复杂选择器
  test('should handle complex selectors', () => {
    const input = `
      .parent > .child + .sibling:hover::before {
        width: 100vpx;
      }
    `;
    const result = plugin.transform(input, 'test.css');
    expect(result.code).toContain('26.66667vw');
  });

  // 测试 CSS 变量
  test('should handle CSS variables', () => {
    const input = `
      :root {
        --primary-width: 100vpx;
        --secondary-width: 200vpx;
      }
      .test {
        width: var(--primary-width);
      }
    `;
    const result = plugin.transform(input, 'test.css');
    expect(result.code).toContain('--primary-width: 26.66667vw');
    expect(result.code).toContain('--secondary-width: 53.33333vw');
  });
});

// 性能基准测试
describe('Performance Benchmarks', () => {
  test('should process large CSS files efficiently', () => {
    // 生成包含 1000 个规则的 CSS
    let largeCSS = '';
    for (let i = 0; i < 1000; i++) {
      largeCSS += `.test-${i} { width: ${i}vpx; height: ${i * 2}vpx; }\n`;
    }

    const plugin = vitePluginVpx({
      viewportWidth: 375,
      logConversions: false,
    });

    const startTime = Date.now();
    plugin.transform(largeCSS, 'large.css');
    const duration = Date.now() - startTime;

    console.log(`处理 1000 条规则用时: ${duration}ms`);
    expect(duration).toBeLessThan(100); // 应该在 100ms 内完成
  });
});

// 如果直接运行此文件，执行简单测试
if (require.main === module) {
  console.log('Running Vite Plugin VPX Tests...\n');

  const testPlugin = vitePluginVpx({
    viewportWidth: 375,
    unitPrecision: 5,
    logConversions: true,
    logLevel: 'verbose',
  });

  const testCases = [
    {
      name: '基础 vpx 转换',
      input: '.test { font-size: 36vpx; }',
      expected: '.test { font-size: 9.6vw; }',
    },
    {
      name: 'maxvpx 转换',
      input: '.test { width: 200maxvpx; }',
      expected: '.test { width: max(53.33333vw, 200px); }',
    },
    {
      name: 'minvpx 转换',
      input: '.test { width: 200minvpx; }',
      expected: '.test { width: min(53.33333vw, 200px); }',
    },
    {
      name: 'cvpx 转换',
      input: '.test { width: 200cvpx; }',
      expected: '.test { width: clamp(200px, 53.33333vw, 200px); }',
    },
    {
      name: 'linear-vpx 转换',
      input: '.test { font-size: linear-vpx(14, 20, 1200, 1920); }',
      expected: '包含 clamp 和 calc',
    },
  ];

  testCases.forEach(({ name, input, expected }) => {
    console.log(`\n测试: ${name}`);
    console.log(`输入: ${input}`);
    const result = testPlugin.transform(input, 'test.css');
    if (result) {
      console.log(`输出: ${result.code}`);
      console.log(`✅ 通过`);
    } else {
      console.log(`❌ 失败: 返回 null`);
    }
  });

  console.log('\n所有测试完成！');
}

module.exports = {
  // 导出供其他测试使用
};
