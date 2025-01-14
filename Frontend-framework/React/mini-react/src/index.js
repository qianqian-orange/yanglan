import React, { createRoot, useState, createContext, useContext } from './libs'

const CounterContext = createContext()

function HelloWorld() {
  const value = useContext(CounterContext)

  return <h1>{value}</h1>
}

function App() {
  const [count] = useState(0)

  return (
    <div>
      <CounterContext.Provider value={count}>
        <HelloWorld />
      </CounterContext.Provider>
    </div>
  )
}

const root = createRoot(document.getElementById('app'))
root.render(<App />)
