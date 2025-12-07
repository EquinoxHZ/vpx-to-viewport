/**
 * 对比测试：PostCSS 版本 vs Vite Plugin 版本
 * 确保两种模式的行为一致
 */

const postcss = require('postcss');
const vpxToVwPostCSS = require('./index');
const vitePluginVpx = require('./vite-plugin-vpx.js');
const {
  basicTests,
  unitVariantTests,
  configTests,
  negativeValueTests,
  mediaQueryTests,
  cssVariableTests,
  complexSelectorTests,
  linearVpxTests,
  boundaryTests,
} = require('./shared-tests');

// 合并所有测试用例
const allTests = [
  ...basicTests,
  ...unitVariantTests,
  ...configTests,
  ...negativeValueTests,
  ...mediaQueryTests,
  ...cssVariableTests,
  ...complexSelectorTests,
  ...linearVpxTests,
  ...boundaryTests,
];

describe('Cross-Platform Consistency Tests', () => {
  describe('PostCSS vs Vite Plugin - Behavior Consistency', () => {
    allTests.forEach((testCase) => {
      test(`[Both] ${testCase.name}`, async () => {
        const options = testCase.options || {};
        
        // PostCSS 版本
        const postcssPlugin = vpxToVwPostCSS(options);
        const postcssResult = await postcss([postcssPlugin]).process(testCase.input, {
          from: undefined,
        });
        const postcssOutput = postcssResult.css;

        // Vite Plugin 版本
        const vitePlugin = vitePluginVpx(options);
        const viteResult = vitePlugin.transform(testCase.input, 'test.css');
        const viteOutput = viteResult ? viteResult.code : testCase.input;

        // 如果有精确的期望值，两者都应该匹配
        if (testCase.expected) {
          expect(postcssOutput).toBe(testCase.expected);
          expect(viteOutput).toBe(testCase.expected);
          
          // 确保两种模式输出一致
          expect(postcssOutput).toBe(viteOutput);
        }

        // 如果有包含检查，两者都应该包含指定内容
        if (testCase.expectedContains) {
          testCase.expectedContains.forEach((substring) => {
            expect(postcssOutput).toContain(substring);
            expect(viteOutput).toContain(substring);
          });
          
          // 确保两种模式输出一致
          expect(postcssOutput).toBe(viteOutput);
        }
      });
    });
  });

  // 性能对比测试
  describe('Performance Comparison', () => {
    test('should compare performance on large CSS', async () => {
      // 生成大型 CSS 文件
      let largeCSS = '';
      for (let i = 0; i < 1000; i++) {
        largeCSS += `.test-${i} { width: ${i}vpx; height: ${i * 2}vpx; }\n`;
      }

      const options = {
        viewportWidth: 375,
        logConversions: false,
      };

      // PostCSS 版本性能测试
      const postcssPlugin = vpxToVwPostCSS(options);
      const postcssStart = Date.now();
      const postcssResult = await postcss([postcssPlugin]).process(largeCSS, {
        from: undefined,
      });
      const postcssDuration = Date.now() - postcssStart;

      // Vite Plugin 版本性能测试
      const vitePlugin = vitePluginVpx(options);
      const viteStart = Date.now();
      const viteResult = vitePlugin.transform(largeCSS, 'large.css');
      const viteDuration = Date.now() - viteStart;

      // 确保输出一致
      expect(postcssResult.css).toBe(viteResult.code);

      // 输出性能对比
      console.log('\n📊 性能对比 (1000 条规则):');
      console.log(`   PostCSS 版本:     ${postcssDuration}ms`);
      console.log(`   Vite Plugin 版本: ${viteDuration}ms`);
      
      if (viteDuration < postcssDuration) {
        const improvement = (((postcssDuration - viteDuration) / postcssDuration) * 100).toFixed(2);
        const speedup = (postcssDuration / viteDuration).toFixed(2);
        console.log(`   ✅ 性能提升: ${improvement}% (${speedup}x 倍速)`);
      } else {
        console.log(`   ℹ️  性能相近或 PostCSS 更快`);
      }

      // 两者都应该在合理时间内完成
      expect(postcssDuration).toBeLessThan(500);
      expect(viteDuration).toBeLessThan(500);
    });
  });

  // 边界情况测试
  describe('Edge Cases', () => {
    test('[Both] should handle empty input', async () => {
      const input = '';
      
      // PostCSS 版本
      const postcssPlugin = vpxToVwPostCSS({});
      const postcssResult = await postcss([postcssPlugin]).process(input, {
        from: undefined,
      });
      
      // Vite Plugin 版本
      const vitePlugin = vitePluginVpx({});
      const viteResult = vitePlugin.transform(input, 'test.css');
      
      expect(postcssResult.css).toBe('');
      expect(viteResult).toBeNull();
    });

    test('[Both] should handle input without vpx', async () => {
      const input = '.test { color: red; font-size: 16px; }';
      
      // PostCSS 版本
      const postcssPlugin = vpxToVwPostCSS({});
      const postcssResult = await postcss([postcssPlugin]).process(input, {
        from: undefined,
      });
      
      // Vite Plugin 版本
      const vitePlugin = vitePluginVpx({});
      const viteResult = vitePlugin.transform(input, 'test.css');
      
      expect(postcssResult.css).toBe(input);
      expect(viteResult).toBeNull(); // Vite Plugin 对于无 vpx 的内容返回 null
    });

    test('[Both] should handle invalid vpx values', async () => {
      const input = '.test { font-size: vpx; width: abcvpx; }';
      
      // PostCSS 版本
      const postcssPlugin = vpxToVwPostCSS({});
      const postcssResult = await postcss([postcssPlugin]).process(input, {
        from: undefined,
      });
      
      // Vite Plugin 版本
      const vitePlugin = vitePluginVpx({});
      const viteResult = vitePlugin.transform(input, 'test.css');
      
      // 两者都应该保持原样（无效值不转换）
      expect(postcssResult.css).toBe(input);
      expect(viteResult.code).toBe(input);
    });
  });
});

// 如果直接运行此文件
if (require.main === module) {
  console.log('🧪 运行对比测试...\n');
  
  const { execSync } = require('child_process');
  try {
    execSync('npm test -- cross-platform.test.js', { stdio: 'inherit' });
  } catch (error) {
    process.exit(1);
  }
}

module.exports = {};
