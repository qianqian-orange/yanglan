import React, { useEffect, useRef } from 'react'
import Icon from './components/Icon'

function App() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    window.document.addEventListener('selectionchange', () => {
      console.log('selectionchange', document.getSelection())
    })
  }, [])

  useEffect(() => {
    ref.current?.focus()
  }, [])

  return (
    <div className='editable-container'>
      <div className='editable-tool-bar'>
        <Icon>format_bold</Icon>
      </div>
      <div className='editable-content' ref={ref} contentEditable />
    </div>
  )
}

export default App
