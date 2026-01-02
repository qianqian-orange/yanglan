import React from 'react'
import {
  useQuery,
  // useMutation,
  // useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

const queryClient = new QueryClient()

async function getTodos() {
  return new Promise(resolve => setTimeout(() => resolve(['todo1', 'todo2']), 1000))
}

function Todos() {
  // Access the client
  // const queryClient = useQueryClient()

  // Queries
  const query = useQuery({ queryKey: ['todos'], queryFn: getTodos })

  return (
    <div>
      {query.data?.map(item => <div key={item}>{item}</div>)}
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Todos />
    </QueryClientProvider>
  )
}

export default App
