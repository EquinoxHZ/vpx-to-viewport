const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: path.resolve(__dirname, '../../webpack-loader-vpx.js'),
            options: {
              viewportWidth: 1920,
              unitPrecision: 5,
              minPixelValue: 1,
              maxRatio: 1.2,
              minRatio: 0.8,
              clampMinRatio: 0.5,
              clampMaxRatio: 2,
              linearMinWidth: 1200,
              linearMaxWidth: 1920,
              autoClampLinear: true,
              logConversions: true,
              logLevel: 'info',
              selectorBlackList: ['.ignore-vpx'],
              variableBlackList: ['--keep-vpx'],
              mediaQueries: {
                '@media (min-width: 768px)': {
                  viewportWidth: 768,
                  maxRatio: 1.5,
                  minRatio: 0.9,
                },
                '@media (min-width: 1200px)': {
                  viewportWidth: 1200,
                  maxRatio: 1,
                  minRatio: 1,
                },
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 9000,
    hot: true,
  },
  mode: 'development',
};
