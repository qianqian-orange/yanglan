import React from 'react'
import { create } from './libs'

const useCounterStore = create(set => ({
  counter: 0,
  setCounter: counter => set(() => ({ counter })),
}))

function App() {
  const counter = useCounterStore(state => state.counter)
  const setCounter = useCounterStore(state => state.setCounter)

  return (
    <div>
      <h1 onClick={() => setCounter(counter + 1)}>{counter}</h1>
    </div>
  )
}

export default App
