/**
 * linear-vpx 功能演示
 * 展示如何使用 linear-vpx() 函数实现响应式线性缩放
 */

const postcss = require('postcss');
const vpxToVw = require('../index');

console.log('='.repeat(80));
console.log('linear-vpx 功能演示');
console.log('='.repeat(80));

// 示例 1: 基础用法 - 4 参数完全自定义
console.log('\n【示例 1】基础用法 - 完全自定义参数');
console.log('输入：width: linear-vpx(840, 1000, 1200, 1920);');
const css1 = '.hero { width: linear-vpx(840, 1000, 1200, 1920); }';
const result1 = postcss([vpxToVw()]).process(css1, { from: undefined });
console.log('输出：', result1.css);
console.log('说明：当视口从 1200px 增长到 1920px 时，宽度从 840px 线性增长到 1000px');

// 示例 2: 简化用法 - 2 参数使用默认视口区间
console.log('\n【示例 2】简化用法 - 使用默认视口区间');
console.log('输入：font-size: linear-vpx(16, 24);');
const css2 = '.text { font-size: linear-vpx(16, 24); }';
const result2 = postcss([vpxToVw({
  linearMinWidth: 375,
  linearMaxWidth: 1920,
})]).process(css2, { from: undefined });
console.log('配置：linearMinWidth: 375, linearMaxWidth: 1920');
console.log('输出：', result2.css);
console.log('说明：字体大小在 375px 到 1920px 视口范围内从 16px 线性增长到 24px');

// 示例 3: 禁用 clamp 包裹
console.log('\n【示例 3】禁用 clamp 包裹');
console.log('输入：padding: linear-vpx(20, 40, 768, 1440);');
const css3 = '.container { padding: linear-vpx(20, 40, 768, 1440); }';
const result3 = postcss([vpxToVw({
  autoClampLinear: false,
})]).process(css3, { from: undefined });
console.log('配置：autoClampLinear: false');
console.log('输出：', result3.css);
console.log('说明：不使用 clamp 限制，允许值在视口区间外继续线性外推');

// 示例 4: 负数值
console.log('\n【示例 4】负数值');
console.log('输入：margin-left: linear-vpx(-100, -50, 1200, 1920);');
const css4 = '.element { margin-left: linear-vpx(-100, -50, 1200, 1920); }';
const result4 = postcss([vpxToVw()]).process(css4, { from: undefined });
console.log('输出：', result4.css);
console.log('说明：支持负数值，适用于负边距等场景');

// 示例 5: 媒体查询中的独立配置
console.log('\n【示例 5】媒体查询中的独立配置');
const css5 = `
.responsive {
  width: linear-vpx(300, 400);
}

@media (min-width: 768px) {
  .responsive {
    width: linear-vpx(600, 900);
  }
}

@media (min-width: 1440px) {
  .responsive {
    width: linear-vpx(800, 1200);
  }
}
`;
const result5 = postcss([vpxToVw({
  linearMinWidth: 375,
  linearMaxWidth: 768,
  mediaQueries: {
    '@media (min-width: 768px)': {
      linearMinWidth: 768,
      linearMaxWidth: 1440,
    },
    '@media (min-width: 1440px)': {
      linearMinWidth: 1440,
      linearMaxWidth: 1920,
      autoClampLinear: false, // 大屏幕不限制上限
    },
  },
})]).process(css5, { from: undefined });
console.log('输入：', css5.trim());
console.log('\n配置：');
console.log('  默认：375-768px');
console.log('  @media (min-width: 768px)：768-1440px');
console.log('  @media (min-width: 1440px)：1440-1920px (无 clamp)');
console.log('\n输出：', result5.css);

// 示例 6: 混合使用 linear-vpx 和其他 vpx 单位
console.log('\n【示例 6】混合使用不同单位');
const css6 = `
.card {
  width: linear-vpx(300, 500, 768, 1920);
  padding: 20vpx;
  margin-top: 30maxvpx;
  border-radius: 8cvpx;
}
`;
const result6 = postcss([vpxToVw({
  viewportWidth: 375,
  maxRatio: 1.5,
  clampMinRatio: 0.5,
  clampMaxRatio: 2,
})]).process(css6, { from: undefined });
console.log('输入：', css6.trim());
console.log('\n输出：', result6.css);
console.log('说明：linear-vpx 可以与 vpx、maxvpx、minvpx、cvpx 混合使用');

// 示例 7: 实际应用场景 - 响应式卡片布局
console.log('\n【示例 7】实际应用场景 - 响应式卡片布局');
const css7 = `
.card-grid {
  /* 容器宽度：小屏 100%，大屏固定最大宽度 */
  width: 100%;
  max-width: 1200px;

  /* 网格间距：从 16px 到 32px 线性增长 */
  gap: linear-vpx(16, 32, 375, 1920);

  /* 内边距：从 20px 到 40px 线性增长 */
  padding: linear-vpx(20, 40, 375, 1920);
}

.card {
  /* 卡片圆角：从 8px 到 16px 线性增长 */
  border-radius: linear-vpx(8, 16, 375, 1920);

  /* 标题字体：从 18px 到 28px 线性增长 */
  font-size: linear-vpx(18, 28, 375, 1920);

  /* 行高：从 24px 到 36px 线性增长 */
  line-height: linear-vpx(24, 36, 375, 1920);
}
`;
const result7 = postcss([vpxToVw()]).process(css7, { from: undefined });
console.log('输入：', css7.trim());
console.log('\n输出：', result7.css);

// 示例 8: 黑名单功能
console.log('\n【示例 8】选择器黑名单');
const css8 = `
.no-transform {
  width: linear-vpx(300, 500, 768, 1920);
}

.transform {
  width: linear-vpx(300, 500, 768, 1920);
}
`;
const result8 = postcss([vpxToVw({
  selectorBlackList: ['.no-transform'],
})]).process(css8, { from: undefined });
console.log('输入：', css8.trim());
console.log('\n配置：selectorBlackList: [".no-transform"]');
console.log('\n输出：', result8.css);
console.log('说明：黑名单中的选择器不会被转换');

console.log('\n' + '='.repeat(80));
console.log('演示完成！');
console.log('='.repeat(80));
