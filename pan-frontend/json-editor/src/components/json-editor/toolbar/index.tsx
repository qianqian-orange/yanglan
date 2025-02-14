import React from 'react'
import { ImportButton } from './import-button'
import { ExportButton } from './export-button'

function Toolbar() {
  return (
    <div className='flex justify-end'>
      <ImportButton className='mr-2' />
      <ExportButton />
    </div>
  )
}

export default Toolbar
