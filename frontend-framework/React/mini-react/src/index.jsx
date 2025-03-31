import React, { createRoot, useState } from './libs'

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
      <h1 onClick={() => setCount(count + 1)}>{count}</h1>
      <HelloWorld />
    </div>
  )
}

const root = createRoot(document.getElementById('app'))
root.render(<App />)
