import { render } from 'preact'
import { useSignal } from '@preact/signals'

function App() {
  const counter = useSignal(0)

  return <h1 onClick={() => counter.value++}>{counter.value}</h1>
}

render(<App />, document.querySelector('#app'))
