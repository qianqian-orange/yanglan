import React, { createRoot, useState } from './libs/mini-react'

function HelloWorld() {
  return <h1>are you ok?</h1>
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
