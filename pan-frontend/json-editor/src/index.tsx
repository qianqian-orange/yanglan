import React from 'react'
import { ChevronRight } from 'lucide-react'
import { createRoot } from 'react-dom/client'
import { Button } from './components/ui/button'
import './index.css'

function App() {
  return (
    <div style={{ width: '100px', margin: '120px auto 0' }}>
      <div className='mb-2'>
        <Button>Primary Button</Button>
      </div>
      <div className='mb-2'>
        <Button variant='secondary'>Secondary Button</Button>
      </div>
      <div className='mb-2'>
        <Button variant='destructive'>Destructive Button</Button>
      </div>
      <div className='mb-2'>
        <Button variant='outline'>Outline Button</Button>
      </div>
      <div className='mb-2'>
        <Button variant='ghost'>Ghost Button</Button>
      </div>
      <div className='mb-2'>
        <Button variant='link'>Ghost Button</Button>
      </div>
      <div className='mb-2'>
        <Button variant='outline' size='icon'>
          <ChevronRight />
        </Button>
      </div>
    </div>
  )
}

const root = createRoot(document.querySelector('#app')!)
root.render(<App />)
