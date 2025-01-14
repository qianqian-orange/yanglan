# Next.js

## 1. Link

路由链接

```javascript
import Link from 'next/link'

function App() {
  return <Link href=''>click</Link>
}
```

## 2. Iamge

引用图片资源

## 3. font

```javascript
import LocalFont from 'next/font/local'

const myFont = LocalFont({
  src: './my-font.woff2'
})

function App() {
  return <html className={myFont.className}></html>
}
```
