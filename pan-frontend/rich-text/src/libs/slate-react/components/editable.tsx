import React, { useEffect } from 'react'
import { useChildren } from '../hooks/use-children'
import { useSlate } from '../hooks/use-slate'
import SlateSelection from '@/libs/slate/SlateSelection'

function Children() {
  const editor = useSlate()
  return useChildren({ node: editor.slateRootNode })
}

function Editable() {
  const editor = useSlate()

  useEffect(() => {
    const onDOMSelectionChange = () => {
      const domSelection = document.getSelection()
      if (!domSelection) return
      const { anchorNode, focusNode } = domSelection
      if (
        editor.domEl?.contains(anchorNode) &&
        editor.domEl?.contains(focusNode)
      ) {
        editor.slateSelection = SlateSelection.toSlateSelection(domSelection)
      } else {
        editor.slateSelection = null
      }
    }
    document.addEventListener('selectionchange', onDOMSelectionChange)
    return () => {
      document.removeEventListener('selectionchange', onDOMSelectionChange)
    }
  }, [])

  useEffect(() => {
    const onDOMBeforeInput = (event: InputEvent) => {
      event.preventDefault()
      switch (event.inputType) {
        // 插入文本
        case 'insertText':
          editor.insertText(event.data || '')
          break
        // 插入行
        case 'insertParagraph':
          editor.insertParagraph()
          break
        // 删除文本
        case 'deleteContentBackward':
          editor.deleteContentBackward()
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
    if (!selection || !editor.slateSelection) return
    // 获取StaticRange对象
    const range = SlateSelection.toDOMRange(
      editor.slateRootNode,
      editor.slateSelection,
    )
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
