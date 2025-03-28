const path = require('path')

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: {
    system: path.resolve(__dirname, '../node_modules/systemjs/dist/system.js'),
  },
  output: {
    filename: '[name].[contenthash:6].js',
    path: path.resolve(__dirname, '../dist/common'),
    clean: true,
  },
}
