import React, { useState } from 'react'

function App() {
  const [counter, setCounter] = useState(0)

  return (
    <div>
      <h1
        style={{ color: 'red', fontSize: '16px' }}
        onClick={() => setCounter(counter + 1)}
      >
        {counter}
      </h1>
    </div>
  )
}

export default App
