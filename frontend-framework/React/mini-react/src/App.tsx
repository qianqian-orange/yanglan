import { Suspense } from 'react'
import React, { use } from './libs'

function HelloWorld({ fetchData }: { fetchData: Promise<string> }) {
  const data = use(fetchData)
  return <h1>{data}</h1>
}

function App() {
  const fetchData = Promise.resolve('hello world')

  return (
    <div>
      <Suspense fallback={<h1>Loading...</h1>}>
        <HelloWorld fetchData={fetchData} />
      </Suspense>
    </div>
  )
}

export default App
