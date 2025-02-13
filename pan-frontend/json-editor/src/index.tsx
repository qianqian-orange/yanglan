import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

function App() {
  return <div className='h-10 w-10 bg-red-500'>box</div>
}

const root = createRoot(document.querySelector('#app')!)
root.render(<App />)
