import React, { memo, PropsWithChildren } from 'react'
import { isEqual } from 'lodash-es'
import { ELEMENT_TO_NODE } from '@/libs/slate-dom/utils/weak-maps'
import { SlateNode } from '@/libs/slate/interfaces/node'

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
    ref(el: Node) {
      ELEMENT_TO_NODE.set(el, node)

      return () => {
        ELEMENT_TO_NODE.delete(el)
      }
    },
  }

  return renderText({ attributes, node, children: node.text })
}

export default memo(Text, (prevProps, nextProps) => {
  console.log('text')
  return isEqual(prevProps.node, nextProps.node)
})
