module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  rules: {
    // 在Windows环境下，允许CRLF换行符以避免冲突
    'linebreak-style': process.platform === 'win32' ? 'off' : ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'no-unused-vars': 'warn',

    // 以下规则与prettier保持一致
    'indent': ['error', 2],
    'comma-dangle': ['error', 'es5'],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    'computed-property-spacing': ['error', 'never'],
    'no-trailing-spaces': 'error',
    'eol-last': 'error',
  }
};
