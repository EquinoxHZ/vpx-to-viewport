module.exports = {
  // 基本格式
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  doubleQuote: false,

  // 缩进
  tabWidth: 2,
  useTabs: false,

  // 换行
  endOfLine: 'lf',

  // 代码行宽度
  printWidth: 100,

  // 在对象字面量中的括号间添加空格
  bracketSpacing: true,

  // 在多行元素的最后一行放置 >
  bracketSameLine: false,

  // 箭头函数参数周围的括号
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
