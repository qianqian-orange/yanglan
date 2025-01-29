import React, { useEffect, useMemo, useReducer } from 'react'
import Editable from './editable'
import Toolbar from './toolbar'
import { SlateContext } from '../hooks/use-slate'
import { createEditor, noop } from '@/libs/slate/create-editor'

function Slate() {
  const [, forceUpdate] = useReducer((s) => s + 1, 0)
  const editor = useMemo(() => createEditor(), [])

  useEffect(() => {
    editor.forceUpdate = forceUpdate
    return () => {
      editor.forceUpdate = noop
    }
  }, [])

  return (
    <SlateContext.Provider value={{ editor }}>
      <div className='editable-container'>
        <Toolbar />
        <Editable />
      </div>
    </SlateContext.Provider>
  )
}

export default Slate
