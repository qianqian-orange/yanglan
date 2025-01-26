import React, { useEffect, useMemo, useRef } from 'react'
import { createEditor } from './libs/slate/create-editor'
import { SlateContext } from './libs/slate-react/hooks/use-slate'
import Icon from './components/Icon'
import { useChildren } from './libs/slate-react/hooks/use-children'
import { Descendant } from './libs/slate/interfaces/node'

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [
      { text: 'This is editable ' },
      { text: 'rich', bold: true },
      { text: ' text, ' },
      { text: 'much', italic: true },
      { text: ' better than a ' },
      { text: '<textarea>', code: true },
      { text: '!' },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'Since it is rich text, you can do things like turn a selection of text ',
      },
      { text: 'bold', bold: true },
      {
        text: ', or add a semantically rendered block quote in the middle of the page, like this:',
      },
    ],
  },
  {
    type: 'block-quote',
    children: [{ text: 'A wise quote.' }],
  },
  {
    type: 'paragraph',
    align: 'center',
    children: [{ text: 'Try it out for yourself!' }],
  },
]

function App() {
  const ref = useRef<HTMLDivElement>(null)
  const editor = useMemo(() => createEditor(initialValue), [])

  useEffect(() => {
    window.document.addEventListener('selectionchange', () => {
      console.log('selectionchange', document.getSelection())
    })
  }, [])

  useEffect(() => {
    ref.current?.focus()
  }, [])

  return (
    <SlateContext.Provider value={{ editor }}>
      <div className='editable-container'>
        <div className='editable-toolbar'>
          <Icon>format_bold</Icon>
        </div>
        <div
          className='editable-content'
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          data-slate-editor
        >
          {useChildren({ node: editor })}
        </div>
      </div>
    </SlateContext.Provider>
  )
}

export default App
