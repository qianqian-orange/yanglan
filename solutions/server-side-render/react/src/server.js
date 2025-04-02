const path = require('path')
const webpack = require('webpack')
const webpackDevServer = require('webpack-dev-server')
const React = require('react')
const { renderToString } = require('react-dom/server')
const config = require('../configs/webpack.dev')
const App = require('./App').default

const complier = webpack(config)
const server = new webpackDevServer(
  {
    ...config.devServer,
    devMiddleware: {
      modifyResponseData(req, res, data, byteLength) {
        if (req.url === '/') {
          const instance = server.middleware
          const filename = instance.getFilenameFromUrl(req.url)
          const {
            outputFileSystem,
            stats: { compilation },
          } = instance.context
          let html = outputFileSystem.readFileSync(filename, {
            encoding: 'utf-8',
          })
          html = html.replace(
            /<!--react-ssr-outlet-->/,
            renderToString(<App />),
          )
          const outputPath = compilation.getPath(
            compilation.outputOptions.path || '',
          )
          const outputFilename = path.resolve(
            outputPath,
            './index.template.html',
          )
          outputFileSystem.writeFileSync(outputFilename, html)
          const len = Buffer.byteLength(html)
          const readStream = outputFileSystem.createReadStream(outputFilename)
          return {
            data: readStream,
            byteLength: len,
          }
        }
        return { data, byteLength }
      },
    },
  },
  complier,
)

;(async () => {
  await server.start()
})()
