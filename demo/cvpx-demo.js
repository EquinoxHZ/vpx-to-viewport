const postcss = require('postcss');
const vpxToVw = require('../index');

// CVpx 单位演示
console.log('=== CVpx 单位转换演示 ===\n');

const testCases = [
  {
    name: '基本 cvpx 转换',
    css: `
.element {
  font-size: 36cvpx;
  padding: 20cvpx;
  margin: 15cvpx;
}`,
    options: {},
  },
  {
    name: '负数 cvpx 转换',
    css: `
.element {
  margin-left: -20cvpx;
  text-indent: -15cvpx;
  transform: translateX(-30cvpx);
}`,
    options: {},
  },
  {
    name: '自定义 clamp 比例',
    css: `
.element {
  font-size: 40cvpx;
  line-height: 24cvpx;
}`,
    options: {
      clampMinRatio: 0.3,
      clampMaxRatio: 3,
    },
  },
  {
    name: '混合单位使用',
    css: `
.card {
  width: 300vpx;
  min-width: 200maxvpx;
  max-width: 500minvpx;
  font-size: 32cvpx;
  padding: 16cvpx 24cvpx;
  margin: 10vpx auto;
}`,
    options: {},
  },
  {
    name: '响应式网格布局',
    css: `
.grid-container {
  grid-template-columns: repeat(auto-fit, minmax(250cvpx, 1fr));
  gap: 20cvpx;
  padding: 32cvpx;
}

.grid-item {
  padding: 24cvpx;
  border-radius: 8cvpx;
  font-size: 18cvpx;
  line-height: 28cvpx;
}`,
    options: {
      clampMinRatio: 0.4,
      clampMaxRatio: 2.5,
    },
  },
];

async function runDemo() {
  for (const testCase of testCases) {
    console.log(`### ${testCase.name}\n`);

    // 显示配置信息
    if (Object.keys(testCase.options).length > 0) {
      console.log('配置选项:');
      Object.entries(testCase.options).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
      console.log();
    }

    console.log('输入:');
    console.log(testCase.css.trim());
    console.log('\n输出:');

    try {
      const result = await postcss([vpxToVw(testCase.options)])
        .process(testCase.css, { from: undefined });

      console.log(result.css.trim());
    } catch (error) {
      console.error('转换失败:', error.message);
    }

    console.log('\n' + '='.repeat(60) + '\n');
  }
}

// 运行演示
runDemo().catch(console.error);
