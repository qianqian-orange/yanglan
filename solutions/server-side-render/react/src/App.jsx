import React, { useState } from 'react'

function App() {
  const [counter, setCounter] = useState(0)

  return (
    <div>
      <h1
        onClick={() => {
          setCounter(counter + 1)
        }}
      >
        hello world{counter}
      </h1>
    </div>
  )
}

export default App
