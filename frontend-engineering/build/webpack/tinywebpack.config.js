const path = require('path')

const resolvePath = (...paths) => path.join(__dirname, ...paths)

module.exports = {
  entry: resolvePath('./src/index.js'),
  output: {
    filename: 'main.js',
    path: resolvePath('./dist'),
  },
}
