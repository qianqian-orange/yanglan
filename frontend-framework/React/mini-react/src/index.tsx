import React, { createRoot, useState } from './libs'

function App() {
  const [count, setCount] = useState(0)

  return <h1 onClick={() => setCount(count + 1)}>hello world</h1>
}

const root = createRoot(document.getElementById('app'))
root.render(<App />)
