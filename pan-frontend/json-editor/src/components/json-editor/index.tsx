import React from 'react'
import Toolbar from './toolbar'
import Editor from './editor'

function JSONEditor() {
  return (
    <div className='flex min-h-96 w-full min-w-[960px] flex-col rounded-md border p-4'>
      <Toolbar />
      <Editor />
    </div>
  )
}

export { JSONEditor }
