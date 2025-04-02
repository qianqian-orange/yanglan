import React, { useState } from './libs'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <h1
        style={{ color: 'red', fontSize: '16px' }}
        onClick={() => setCount(count + 1)}
      >
        {count}
      </h1>
    </div>
  )
}

export default App
