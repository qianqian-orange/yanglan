const express = require('express')
const rollup = require('rollup')

const app = express()

async function build() {
  const bundle = await rollup.rollup({
    input: './src/index.js',
  })
  await bundle.write({
    dir: 'dist',
    format: 'es',
  })
}

app.use('/build', async (req, res) => {
  await build()
  res.send('hello world')
})

app.listen(3000, () => {
  console.log('server start at port 3000')
})
