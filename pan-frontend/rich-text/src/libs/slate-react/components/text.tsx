import React, { PropsWithChildren } from 'react'
import { ELEMENT_TO_NODE } from '@/libs/slate-dom/utils/weak-maps'
import SlateNode from '@/libs/slate/SlateNode'

function renderText({
  attributes,
  node,
  children,
}: PropsWithChildren<{
  attributes: { [key: string]: unknown }
  node: SlateNode
}>) {
  if (node.bold) {
    children = <strong>{children}</strong>
  }
  if (node.code) {
    children = <code>{children}</code>
  }
  if (node.italic) {
    children = <em>{children}</em>
  }
  if (node.underline) {
    children = <u>{children}</u>
  }
  return <span {...attributes}>{children}</span>
}

function Text({ node }: { node: SlateNode }) {
  const attributes = {
    'data-slate-node': 'text',
    className: node.className || '',
    ref(el: HTMLElement) {
      node.stateNode = el
      ELEMENT_TO_NODE.set(el, node)

      return () => {
        delete node.stateNode
        ELEMENT_TO_NODE.delete(el)
      }
    },
  }

  return renderText({
    attributes,
    node,
    children: <span data-slate-string>{node.text}</span>,
  })
}

export default Text
