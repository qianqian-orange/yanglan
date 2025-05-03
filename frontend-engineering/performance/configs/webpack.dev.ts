const path = require('path')
import webpack from 'webpack'
import { Configuration } from 'webpack-dev-server'
const { merge } = require('webpack-merge')
const baseConfig = require('./webpack.base')

const resolvePath = (...paths: string[]) => path.join(__dirname, ...paths)

const config: webpack.Configuration & Configuration = {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    port: 8000,
    static: resolvePath('../dist'),
    open: true,
    historyApiFallback: true,
  },
}

module.exports = merge(baseConfig, config)
