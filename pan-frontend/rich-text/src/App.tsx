import React, { useMemo } from 'react'
import { createEditor } from './libs/slate/create-editor'
import { Descendant } from './libs/slate/interfaces/node'
import Slate from './libs/slate-react/components/slate'

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
  const editor = useMemo(() => createEditor(initialValue), [])

  return <Slate editor={editor} />
}

export default App
