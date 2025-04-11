// const path = require('path')
// const webpack = require('webpack')
// const webpackDevServer = require('webpack-dev-server')
// const React = require('./libs').default
// const { renderToString } = require('./libs/react-dom/server')
// const config = require('../configs/webpack.dev')
// const App = require('./App').default

// const complier = webpack(config)
// const server = new webpackDevServer(
//   {
//     ...config.devServer,
//     devMiddleware: {
//       modifyResponseData(req, res, data, byteLength) {
//         if (req.url === '/') {
//           const instance = server.middleware
//           const filename = instance.getFilenameFromUrl(req.url)
//           const {
//             outputFileSystem,
//             stats: { compilation },
//           } = instance.context
//           let html = outputFileSystem.readFileSync(filename, {
//             encoding: 'utf-8',
//           })
//           html = html.replace(
//             /<!--react-ssr-outlet-->/,
//             renderToString(<App />),
//           )
//           const outputPath = compilation.getPath(
//             compilation.outputOptions.path || '',
//           )
//           const outputFilename = path.resolve(
//             outputPath,
//             './index.template.html',
//           )
//           outputFileSystem.writeFileSync(outputFilename, html)
//           const len = Buffer.byteLength(html)
//           const readStream = outputFileSystem.createReadStream(outputFilename)
//           return {
//             data: readStream,
//             byteLength: len,
//           }
//         }
//         return { data, byteLength }
//       },
//     },
//   },
//   complier,
// )

// ;(async () => {
//   await server.start()
// })()

const webpack = require('webpack')
const webpackDevServer = require('webpack-dev-server')
const { JSDOM } = require('jsdom')
const React = require('./libs').default
const { renderToPipeableStream } = require('./libs/react-dom/server')
const config = require('../configs/webpack.dev')
const ServerRenderTemplate = require('./ServerRenderTemplate').default

const complier = webpack(config)

let ready = false
let callback = []

complier.hooks.done.tap('serverRender', stats => {
  ready = true
  callback.forEach(cb => cb(stats))
})

const server = new webpackDevServer(
  {
    ...config.devServer,
    setupMiddlewares: (middlewares, devServer) => {
      middlewares.unshift({
        path: '/',
        middleware(req, res, next) {
          if (req.url === '/') {
            const cb = stats => {
              const {
                middleware: {
                  context: { outputFileSystem },
                },
              } = devServer
              const { compilation } = stats
              const filename = `${compilation.outputOptions.path}/index.html`
              let html = outputFileSystem.readFileSync(filename, {
                encoding: 'utf-8',
              })
              const dom = new JSDOM(html)
              const bootstrapScripts = [
                ...dom.window.document.querySelectorAll('script'),
              ].map(script => script.src)
              const { pipe } = renderToPipeableStream(
                <ServerRenderTemplate />,
                {
                  bootstrapScripts,
                  onShellReady() {
                    pipe(res)
                  },
                },
              )
            }
            if (!ready) callback.push(cb)
            else cb(devServer.middleware.context.stats)
          } else next()
        },
      })
      return middlewares
    },
  },
  complier,
)

;(async () => {
  await server.start()
})()

// const express = require('express')
// const React = require('./libs').default
// const { renderToPipeableStream } = require('./libs/react-dom/server')
// const App = require('./App').default

// const app = express()

// app.use('/', (req, res) => {
//   const { pipe } = renderToPipeableStream(<App />, {
//     onShellReady() {
//       pipe(res)
//     },
//   })
// })

// app.listen(4000, () => {
//   console.log('server start at port 4000')
// })
