import { render } from 'preact'
import { useState } from './libs'

function App() {
  const [counter, setCounter] = useState(0)
  return <h1 onClick={() => setCounter(counter + 1)}>hello world{counter}</h1>
}

render(<App />, document.querySelector('#app'))
