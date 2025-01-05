import React, { createRoot, useState } from './libs'

function HelloWorld() {
  const [count, setCount] = useState(0)

  return (
    <h1
      onClick={() => {
        setCount((s: number) => s + 1)
        setCount((s: number) => s + 1)
      }}
    >
      are you ok?{count}
    </h1>
  )
}

function App() {
  const [visible, setVisible] = useState(true)

  return (
    <div>
      <h1 onClick={() => setVisible(!visible)}>hello react</h1>
      {visible && <HelloWorld />}
    </div>
  )
}

const root = createRoot(document.getElementById('app'))
root.render(<App />)
