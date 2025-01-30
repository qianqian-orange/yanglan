import React, { useEffect } from 'react'
import { useChildren } from '../hooks/use-children'
import { useSlate } from '../hooks/use-slate'
import SlateRange from '@/libs/slate/SlateRange'

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
        // 插入文本
        case 'insertText':
          editor.insertText(event.data || '', staticRange)
          break
        // 插入行
        case 'insertParagraph':
          editor.insertParagraph(staticRange)
          break
        // 删除文本
        case 'deleteContentBackward':
          editor.deleteContentBackward(staticRange)
          break
      }
    }
    editor.domEl?.addEventListener('beforeinput', onDOMBeforeInput)
    return () => {
      editor.domEl?.removeEventListener('beforeinput', onDOMBeforeInput)
    }
  }, [])

  useEffect(() => {
    // 获取Selection对象
    const selection = document.getSelection()
    if (!selection || !editor.slateRange) return
    // 获取StaticRange对象
    const range = SlateRange.toDOMRange(editor.slateRootNode, editor.slateRange)
    const { startContainer, startOffset, endContainer, endOffset } = range
    // 设置光标选择区域
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
