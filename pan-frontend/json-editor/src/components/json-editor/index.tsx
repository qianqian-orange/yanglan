import React from 'react'
import { Toolbar } from './components/toolbar'
import { Editable } from './components/editable'
import { Preview } from './components/preview'

export function JSONEditor() {
  return (
    <div className='flex min-h-96 w-full min-w-[960px] flex-col rounded-md border p-4'>
      <Toolbar />
      <div className='mt-4 flex flex-1 justify-between'>
        <Editable />
        <Preview className='flex-1' />
      </div>
    </div>
  )
}
