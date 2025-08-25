const postcss = require('postcss');
const vpxToVw = require('../index');

// 演示媒体查询功能的实际应用场景
async function mediaQueryDemo() {
  console.log('📱 PostCSS vpx-to-vw 媒体查询功能演示\n');

  // 模拟一个响应式布局的CSS
  const responsiveCSS = `
    /* 基础样式 - 移动端优先 */
    .header {
      height: 60vpx;
      padding: 10vpx 20vpx;
      font-size: 16vpx;
    }

    .container {
      max-width: 375vpx;
      padding: 20vpx;
      margin: 0 auto;
    }

    .card {
      padding: 16vpx;
      margin-bottom: 20vpx;
      border-radius: 8vpx;
      font-size: 14vpx;
      min-height: 100minvpx;
      max-width: 300maxvpx;
    }

    .hero-section {
      padding: 40vpx 20vpx;
      font-size: 24cvpx;
      line-height: 32cvpx;
    }

    /* 平板样式 */
    @media (min-width: 768px) {
      .header {
        height: 80vpx;
        padding: 15vpx 30vpx;
        font-size: 18vpx;
      }

      .container {
        max-width: 768vpx;
        padding: 30vpx;
      }

      .card {
        padding: 24vpx;
        margin-bottom: 30vpx;
        border-radius: 12vpx;
        font-size: 16vpx;
        min-height: 120minvpx;
        max-width: 400maxvpx;
      }

      .hero-section {
        padding: 60vpx 40vpx;
        font-size: 32cvpx;
        line-height: 40cvpx;
      }
    }

    /* 桌面样式 */
    @media (min-width: 1024px) {
      .header {
        height: 100vpx;
        padding: 20vpx 40vpx;
        font-size: 20vpx;
      }

      .container {
        max-width: 1024vpx;
        padding: 40vpx;
      }

      .card {
        padding: 32vpx;
        margin-bottom: 40vpx;
        border-radius: 16vpx;
        font-size: 18vpx;
        min-height: 150minvpx;
        max-width: 500maxvpx;
      }

      .hero-section {
        padding: 80vpx 60vpx;
        font-size: 48cvpx;
        line-height: 56cvpx;
      }
    }

    /* 小屏设备优化 */
    @media (max-width: 480px) {
      .header {
        height: 50vpx;
        padding: 8vpx 16vpx;
        font-size: 14vpx;
      }

      .container {
        max-width: 320vpx;
        padding: 16vpx;
      }

      .card {
        padding: 12vpx;
        margin-bottom: 16vpx;
        border-radius: 6vpx;
        font-size: 13vpx;
        min-height: 80minvpx;
        max-width: 280maxvpx;
      }

      .hero-section {
        padding: 30vpx 16vpx;
        font-size: 20cvpx;
        line-height: 26cvpx;
      }
    }
  `;

  const config = {
    viewportWidth: 375, // 移动端基准
    unitPrecision: 3,
    maxRatio: 1.2,
    minRatio: 0.8,
    clampMinRatio: 0.7,
    clampMaxRatio: 1.8,
    logConversions: true,
    logLevel: 'info',
    mediaQueries: {
      // 平板配置
      '@media (min-width: 768px)': {
        viewportWidth: 768,
        unitPrecision: 2,
        maxRatio: 1.5,
        minRatio: 0.9,
        clampMinRatio: 0.8,
        clampMaxRatio: 2.0,
      },
      // 桌面配置
      '@media (min-width: 1024px)': {
        viewportWidth: 1024,
        unitPrecision: 2,
        maxRatio: 2.0,
        minRatio: 1.0,
        clampMinRatio: 0.9,
        clampMaxRatio: 2.5,
      },
      // 小屏配置
      '@media (max-width: 480px)': {
        viewportWidth: 320,
        unitPrecision: 4,
        maxRatio: 1.0,
        minRatio: 0.7,
        clampMinRatio: 0.6,
        clampMaxRatio: 1.5,
      },
    },
  };

  try {
    const result = await postcss([vpxToVw(config)]).process(responsiveCSS, {
      from: 'responsive.css',
    });

    console.log('🎨 转换后的CSS:\n');
    console.log(result.css);

    console.log('\n📊 配置说明:');
    console.log('• 移动端 (默认): 375px 基准, 精度3位, maxRatio=1.2, minRatio=0.8');
    console.log('• 平板端 (≥768px): 768px 基准, 精度2位, maxRatio=1.5, minRatio=0.9');
    console.log('• 桌面端 (≥1024px): 1024px 基准, 精度2位, maxRatio=2.0, minRatio=1.0');
    console.log('• 小屏端 (≤480px): 320px 基准, 精度4位, maxRatio=1.0, minRatio=0.7');

    console.log('\n✨ 特性说明:');
    console.log('• vpx: 基础视口单位，根据不同屏幕使用不同基准值');
    console.log('• maxvpx: 最大值限制，平板和桌面端使用更大的倍数');
    console.log('• minvpx: 最小值限制，确保元素不会过小');
    console.log('• cvpx: 响应式范围限制，在小屏到大屏之间流畅缩放');

  } catch (error) {
    console.error('❌ 转换失败:', error);
  }
}

// 运行演示
mediaQueryDemo().catch(console.error);
