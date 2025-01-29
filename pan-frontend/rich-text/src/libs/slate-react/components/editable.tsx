import React, { useEffect } from 'react'
import { useChildren } from '../hooks/use-children'
import { useSlate } from '../hooks/use-slate'
import DOMEditor from '@/libs/slate-dom/dom-editor'

function Children() {
  const editor = useSlate()
  return useChildren({ node: editor.slateRootNode })
}

function Editable() {
  const editor = useSlate()

  useEffect(() => {
    const onDOMBeforeInput = (event: InputEvent) => {
      event.preventDefault()
      const [staticRange] = event.getTargetRanges()
      console.log('beforeinput', event.inputType, event.data, staticRange)
      switch (event.inputType) {
        case 'insertText':
          editor.insertText(event.data || '', staticRange)
          break
        case 'deleteContentBackward':
          editor.deleteContentBackward(staticRange)
          break
      }
    }
    editor.domEl!.addEventListener('beforeinput', onDOMBeforeInput)
    return () => {
      editor.domEl!.removeEventListener('beforeinput', onDOMBeforeInput)
    }
  }, [])

  // 设置光标选择区域
  useEffect(() => {
    const selection = document.getSelection()
    if (!selection || !editor.slateRange) return
    const range = DOMEditor.toDOMRange(editor)
    const { startContainer, startOffset, endContainer, endOffset } = range
    selection.setBaseAndExtent(
      startContainer,
      startOffset,
      endContainer,
      endOffset,
    )
  })

  return (
    <div
      ref={(el) => {
        editor.domEl = el
        return () => {
          editor.domEl = null
        }
      }}
      className='editable-content'
      contentEditable
      suppressContentEditableWarning
      data-slate-editor
    >
      <Children />
    </div>
  )
}

export default Editable
