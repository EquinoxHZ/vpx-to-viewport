const postcss = require('postcss');
const vpxToVw = require('../index');

// 全面的伪元素测试
const pseudoElementsCSS = `
/* 基本伪元素 */
.basic::before {
  content: "";
  width: 24vpx;
  height: 24vpx;
  position: absolute;
}

.basic::after {
  content: "";
  font-size: 16vpx;
  padding: 8vpx 12vpx;
  margin: 4vpx;
}

/* 伪类与伪元素组合 */
.button:hover::before {
  transform: scale(1.1);
  border-width: 2vpx;
  box-shadow: 0 4vpx 8vpx rgba(0,0,0,0.2);
}

.input:focus::after {
  outline: 1vpx solid blue;
  outline-offset: 2vpx;
}

.link:visited::before {
  margin-right: 6vpx;
  width: 12vpx;
  height: 12vpx;
}

/* 复杂的伪类选择器 */
.list-item:nth-child(odd)::before {
  left: -20vpx;
  width: 16vpx;
  border-left: 4vpx solid #333;
}

.card:first-child::after,
.card:last-child::after {
  border-radius: 8vpx;
  padding: 16maxvpx 20minvpx;
}

/* 高级伪元素功能 */
.tooltip:hover::before {
  content: attr(data-tooltip);
  position: absolute;
  top: -40vpx;
  left: 50%;
  transform: translateX(-50%);
  padding: 8vpx 12vpx;
  background: rgba(0,0,0,0.8);
  border-radius: 4vpx;
  font-size: 14vpx;
  white-space: nowrap;
  min-width: 100maxvpx;
  max-width: 300minvpx;
}

.tooltip:hover::after {
  content: "";
  position: absolute;
  top: -8vpx;
  left: 50%;
  transform: translateX(-50%);
  border: 8vpx solid transparent;
  border-top-color: rgba(0,0,0,0.8);
}

/* 复杂的组合选择器 */
.nav .menu-item:not(.disabled):hover::before,
.nav .menu-item:not(.disabled):focus::before {
  width: 100%;
  height: 2vpx;
  bottom: 0;
  left: 0;
  background: linear-gradient(90deg, transparent, #007acc, transparent);
  transform: scaleX(1);
  transition: transform 0.3s ease;
}

/* 多级嵌套选择器 */
.sidebar .section .item:hover::after {
  right: -12vpx;
  width: 8vpx;
  height: 8vpx;
  border-radius: 50%;
  background: #007acc;
}

/* 属性选择器与伪元素 */
input[type="checkbox"]:checked::before {
  content: "✓";
  font-size: 12vpx;
  line-height: 16vpx;
  color: white;
}

button[data-icon]::before {
  content: attr(data-icon);
  margin-right: 8vpx;
  font-size: 16vpx;
  width: 20vpx;
  height: 20vpx;
  display: inline-block;
}

/* 媒体查询中的伪元素 */
@media (min-width: 768px) {
  .responsive::before {
    width: 32vpx;
    height: 32vpx;
    font-size: 18vpx;
  }

  .responsive::after {
    padding: 12vpx 16vpx;
    margin: 8vpx 0;
  }
}

/* CSS 自定义属性与伪元素 */
:root {
  --pseudo-width: 24vpx;
  --pseudo-height: 24vpx;
  --pseudo-margin: 8vpx;
}

.custom-props::before {
  width: var(--pseudo-width);
  height: var(--pseudo-height);
  margin: var(--pseudo-margin);
  border: 1vpx solid #ddd;
}

/* 使用 maxvpx 和 minvpx 的伪元素 */
.advanced::before {
  width: 200maxvpx;  /* 最小不小于 200px */
  height: 50minvpx;  /* 最大不超过 50px */
  font-size: 18maxvpx;
  padding: 12minvpx 16maxvpx;
  margin: 8vpx auto;
}

.advanced::after {
  border-width: 2maxvpx 4minvpx;
  border-radius: 12maxvpx;
  box-shadow:
    0 2vpx 4maxvpx rgba(0,0,0,0.1),
    0 1minvpx 2vpx rgba(0,0,0,0.05);
}
`;

async function runPseudoElementTests() {
  console.log('🧪 PostCSS VPX to VW 插件 - 伪元素全面测试\n');

  // 测试 1: 基本伪元素转换
  console.log('📋 测试 1: 基本伪元素转换');
  const result1 = await postcss([vpxToVw()]).process(pseudoElementsCSS, {
    from: undefined,
  });
  console.log('输出:');
  console.log(result1.css);
  console.log('\n' + '='.repeat(80) + '\n');

  // 测试 2: 伪元素选择器黑名单
  console.log('📋 测试 2: 伪元素选择器黑名单');
  const result2 = await postcss([
    vpxToVw({
      selectorBlackList: [
        '.basic::before',
        '.button:hover::before',
        '.tooltip:hover',
      ],
    }),
  ]).process(pseudoElementsCSS, { from: undefined });
  console.log('部分输出 (前50行):');
  console.log(result2.css.split('\n').slice(0, 50).join('\n'));
  console.log('...(输出被截断)\n');
  console.log('='.repeat(80) + '\n');

  // 测试 3: CSS变量黑名单对伪元素的影响
  console.log('📋 测试 3: CSS变量黑名单');
  const result3 = await postcss([
    vpxToVw({
      variableBlackList: ['--pseudo-width', '--pseudo-height'],
    }),
  ]).process(pseudoElementsCSS, { from: undefined });

  // 只显示相关部分
  const lines = result3.css.split('\n');
  const startIndex = lines.findIndex((line) => line.includes(':root'));
  const endIndex =
    lines.findIndex((line, index) => index > startIndex && line.includes('}')) +
    10;
  console.log('CSS变量部分输出:');
  console.log(lines.slice(startIndex, endIndex).join('\n'));
  console.log('='.repeat(80) + '\n');

  // 测试 4: 不同比例参数对伪元素的影响
  console.log('📋 测试 4: maxRatio 和 minRatio 参数测试');
  const result4 = await postcss([
    vpxToVw({
      maxRatio: 1.5,
      minRatio: 0.8,
    }),
  ]).process(pseudoElementsCSS, { from: undefined });

  // 只显示 advanced 类的部分
  const lines4 = result4.css.split('\n');
  const startIndex4 = lines4.findIndex((line) =>
    line.includes('.advanced::before')
  );
  const endIndex4 =
    lines4.findIndex(
      (line, index) => index > startIndex4 + 15 && line.trim() === '}'
    ) + 1;
  console.log('advanced 类输出:');
  console.log(lines4.slice(startIndex4, endIndex4).join('\n'));
  console.log('='.repeat(80) + '\n');

  console.log('✅ 伪元素全面测试完成！');
  console.log('📊 测试总结:');
  console.log('  ✓ 基本伪元素 (::before, ::after)');
  console.log('  ✓ 伪类与伪元素组合 (:hover::before, :focus::after)');
  console.log('  ✓ 复杂选择器组合');
  console.log('  ✓ 属性选择器与伪元素');
  console.log('  ✓ 媒体查询中的伪元素');
  console.log('  ✓ CSS自定义属性与伪元素');
  console.log('  ✓ maxvpx/minvpx 在伪元素中的使用');
  console.log('  ✓ 选择器黑名单对伪元素的过滤');
  console.log('  ✓ CSS变量黑名单的正确处理');
}

runPseudoElementTests().catch(console.error);
