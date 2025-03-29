const webpack = require('webpack')
const webpackDevServer = require('webpack-dev-server')
const config = require('../configs/webpack.dev')

const complier = webpack(config)
const server = new webpackDevServer({}, complier)

;(async () => {
  await server.start()
})()
