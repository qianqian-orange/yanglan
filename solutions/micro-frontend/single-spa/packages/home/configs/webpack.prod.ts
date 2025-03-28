import webpack from 'webpack'
const { merge } = require('webpack-merge')
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin')
const baseConfig = require('./webpack.base')

const config: webpack.Configuration = {
  mode: 'production',
  devtool: 'source-map',
  optimization: {
    minimizer: ['...', new CssMinimizerWebpackPlugin()],
  },
}

module.exports = merge(baseConfig, config)
