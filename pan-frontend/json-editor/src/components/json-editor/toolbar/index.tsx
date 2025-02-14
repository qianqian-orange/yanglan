import React from 'react'
import { ImportButton } from './import-button'
import { ExportButton } from './export-button'

function Toolbar() {
  return (
    <div className='flex justify-end'>
      <div className='mr-2'>
        <ImportButton />
      </div>
      <ExportButton />
    </div>
  )
}

export default Toolbar
