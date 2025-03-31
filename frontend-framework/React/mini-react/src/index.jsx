import React, { createRoot, renderToString, useState } from './libs'

function HelloWorld() {
  return (
    <div>
      <h1>hello world</h1>
    </div>
  )
}

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <h1
        className='helloworld'
        style={{ color: 'red', fontSize: '16px' }}
        onClick={() => setCount(count + 1)}
      >
        {count}
      </h1>
      <HelloWorld />
    </div>
  )
}

const root = createRoot(document.getElementById('app'))
root.render(<App />)

console.log(renderToString(<App />))
