import React from 'react'
import { createRoot } from 'react-dom/client'
import { Header } from './components/header'
import './index.css'

function App() {
  return (
    <div className='relative'>
      <Header />
    </div>
  )
}

const root = createRoot(document.querySelector('#app')!)
root.render(<App />)
