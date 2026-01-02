const express = require('express')

const app = express()

app.get('/', (req, res) => {
  res.json({ data: 'ok' })
})

app.listen(8888, () => {
  console.log('server start at port 8888')
})
