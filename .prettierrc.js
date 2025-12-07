module.exports = {
  // 基本格式 - 与 ESLint 保持一致
  semi: true, // 末尾加分号，与 eslint semi: ['error', 'always'] 对应
  trailingComma: 'all', // 改为 'all'，与 eslint 'comma-dangle': ['error', 'always-multiline'] 对应
  singleQuote: true, // 单引号，与 eslint quotes: ['error', 'single'] 对应

  // 缩进 - 与 ESLint indent: ['error', 2] 对应
  tabWidth: 2,
  useTabs: false,

  // 换行 - 与 editorconfig end_of_line = lf 对应
  endOfLine: 'lf',

  // 代码行宽度
  printWidth: 100,

  // 在对象字面量中的括号间添加空格 - 与 eslint 'object-curly-spacing': ['error', 'always'] 对应
  bracketSpacing: true,

  // 在多行元素的最后一行放置 >
  bracketSameLine: false,

  // 箭头函数参数周围的括号 - 避免不必要的括号
  arrowParens: 'avoid',

  // 不格式化某些文件
  overrides: [
    {
      files: '*.md',
      options: {
        // Markdown文件保持原有的换行
        proseWrap: 'preserve',
      },
    },
  ],
};
