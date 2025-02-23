import React, { useState } from 'react'
import useSWR from './libs'

const fetcher = (...args) => fetch(...args).then(res => res.json())

function App() {
  const [counter, setCounter] = useState(0)
  const { data, error, isValidating, isLoading } = useSWR(
    `/api?counter=${counter}`,
    fetcher,
  )

  console.log('App', data, error, isValidating, isLoading)

  if (isLoading) return <h1>Loading...</h1>

  return (
    <div>
      <h1>{data.data}</h1>
      <h1 onClick={() => setCounter(counter + 1)}>add</h1>
      <h1 onClick={() => setCounter(counter - 1)}>decrease</h1>
    </div>
  )
}

export default App
