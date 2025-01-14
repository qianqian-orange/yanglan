const express = require('express')
const app = express()

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  next()
})

app.get('/', (req, res) => {
  setTimeout(() => {
    res.json({
      username: 'zhangsan',
      age: 10,
    })
  }, 2000)
})

app.listen(8888, () => {
  console.log('server start at port 8888')
})
