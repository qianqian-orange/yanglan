import React from 'react'
import { createRoot } from 'react-dom/client'
import { Header } from './components/header'
import { JSONEditor } from './components/json-editor'
import { Toaster } from './components/ui/toaster'
import './index.css'

function App() {
  return (
    <>
      <div className='relative flex min-h-svh flex-col'>
        <Header />
        <div className='flex flex-1 px-60 py-8'>
          <JSONEditor />
        </div>
      </div>
      <Toaster />
    </>
  )
}

const root = createRoot(document.querySelector('#app')!)
root.render(<App />)
