const postcss = require('postcss');
const vpxToVw = require('../index');

// 测试负数值
console.log('=== 负数值测试 ===\n');

const testCases = [
  {
    name: '负数 vpx',
    css: '.test { margin-left: -20vpx; }',
  },
  {
    name: '负数 maxvpx',
    css: '.test { margin-left: -20maxvpx; }',
  },
  {
    name: '负数 minvpx',
    css: '.test { margin-left: -20minvpx; }',
  },
  {
    name: '负数 cvpx',
    css: '.test { margin-left: -20cvpx; }',
  },
];

async function runTest() {
  for (const testCase of testCases) {
    console.log(`### ${testCase.name}`);
    console.log('输入:', testCase.css);

    try {
      const result = await postcss([vpxToVw()])
        .process(testCase.css, { from: undefined });

      console.log('输出:', result.css);
    } catch (error) {
      console.error('错误:', error.message);
    }

    console.log('');
  }
}

runTest().catch(console.error);
