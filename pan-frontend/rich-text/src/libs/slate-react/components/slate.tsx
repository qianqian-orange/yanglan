import React, { useEffect, useMemo, useReducer } from 'react'
import { noop } from 'lodash-es'
import Editable from './editable'
import Toolbar from './toolbar'
import { SlateContext } from '../hooks/use-slate'
import SlateNode from '@/libs/slate/SlateNode'
import { createEditor } from '@/libs/slate/create-editor'

function Slate({ initialValue }: { initialValue?: SlateNode[] }) {
  const [, forceUpdate] = useReducer((s) => s + 1, 0)
  const editor = useMemo(() => createEditor(initialValue), [])

  useEffect(() => {
    editor.forceUpdate = forceUpdate
    return () => {
      editor.forceUpdate = noop
    }
  }, [])

  return (
    <SlateContext.Provider value={{ editor }}>
      <div className='editable-container'>
        {/* 操作栏 */}
        <Toolbar />
        {/* 编辑区 */}
        <Editable />
      </div>
    </SlateContext.Provider>
  )
}

export default Slate
