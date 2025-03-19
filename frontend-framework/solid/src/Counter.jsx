import { createSignal } from 'solid-js'

function Counter() {
  const [counter, setCounter] = createSignal(0)

  return (
    <div>
      <h1 onClick={() => setCounter(s => s + 1)}>{counter()}</h1>
    </div>
  )
}

export default Counter
