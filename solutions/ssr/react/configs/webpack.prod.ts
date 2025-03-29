import webpack from 'webpack'
const { merge } = require('webpack-merge')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin')
const baseConfig = require('./webpack.base')

const config: webpack.Configuration = {
  mode: 'production',
  devtool: 'source-map',
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash:6].css',
    }),
  ],
  optimization: {
    minimizer: ['...', new CssMinimizerWebpackPlugin()],
  },
}

module.exports = merge(baseConfig, config)
