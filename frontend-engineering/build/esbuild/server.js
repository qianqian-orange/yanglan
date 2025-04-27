const express = require('express')
const esbuild = require('esbuild')

const app = express()

async function bundle() {
  await esbuild.build({
    entryPoints: ['./src/index.jsx'],
    bundle: true,
    outdir: 'dist',
  })
}

app.use('/build', async (req, res) => {
  await bundle()
  res.send('hello world')
})

app.listen(3000, () => {
  console.log('server start at port 3000')
})
