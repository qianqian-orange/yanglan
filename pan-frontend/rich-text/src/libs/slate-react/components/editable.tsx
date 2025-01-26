import React, { useEffect, useRef } from 'react'
import { useChildren } from '../hooks/use-children'
import { useSlate } from '../hooks/use-slate'
import { DOMEditor } from '@/libs/slate-dom/plugins/dom-editor'

function Children() {
  const editor = useSlate()
  return useChildren({ node: editor })
}

function Placeholder({ text }: { text: string }) {
  return (
    <>
      <span contentEditable={false} className='editable-placeholder'>
        {text}
      </span>
      <span>&#xFEFF;</span>
    </>
  )
}

function Editable() {
  const editor = useSlate()
  const elRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onSelectionChange = () => {
      const selection = document.getSelection()
      if (!selection) return
      const { anchorNode, focusNode } = selection
      console.log(selection)
      if (
        DOMEditor.hasEditableTarget(editor, anchorNode) &&
        DOMEditor.hasEditableTarget(editor, focusNode)
      ) {
        DOMEditor.toSlateRange(editor, selection)
      }
    }
    window.document.addEventListener('selectionchange', onSelectionChange)
    return () => {
      window.document.removeEventListener('selectionchange', onSelectionChange)
    }
  }, [])

  useEffect(() => {
    const onDOMBeforeInput = (event: InputEvent) => {
      event.preventDefault()
      console.log(
        'beforeinput',
        event.inputType,
        event.data,
        event.getTargetRanges(),
      )
      switch (event.inputType) {
        case 'insertText':
          break
      }
    }
    elRef.current?.addEventListener('beforeinput', onDOMBeforeInput)
    return () => {
      elRef.current?.removeEventListener('beforeinput', onDOMBeforeInput)
    }
  }, [])

  useEffect(() => {
    editor.domEl = elRef.current
    return () => {
      editor.domEl = null
    }
  }, [])

  return (
    <div
      ref={elRef}
      className='editable-content'
      contentEditable
      suppressContentEditableWarning
      data-slate-editor
      onCompositionStart={(event) => {
        event.preventDefault()
        console.log('onCompositionStart')
      }}
      onCompositionEnd={(event) => {
        event.preventDefault()
        console.log('onCompositionEnd')
      }}
    >
      <Placeholder text='Enter some rich text…' />
      <Children />
    </div>
  )
}

export default Editable
