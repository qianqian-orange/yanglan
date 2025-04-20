import React, { Suspense, use } from 'react'

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
