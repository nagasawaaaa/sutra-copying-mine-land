const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/assets/js/main.js',
  output: {
    filename: 'script.js',
    path: path.join(__dirname, 'public_html/assets/js')
  },
  module: {
    rules: [{
      // ローダーの処理対象ファイル
      test: /\.js$/,
      // ローダーの処理対象から外すディレクトリ
      exclude: /node_modules/,
      // 利用するローダー
      use: [{
        loader: 'babel-loader',
        options: {
          presets: [
            ['env', {'modules': false}]
          ]
        }
      }],
    },{
      enforce: 'pre',
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'eslint-loader'
    }],
  }
};