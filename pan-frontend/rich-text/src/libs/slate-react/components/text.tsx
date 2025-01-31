import React, { PropsWithChildren } from 'react'
import SlateNode, { ELEMENT_TO_NODE } from '@/libs/slate/SlateNode'

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
    ...node.attributes,
    'data-slate-node': 'text',
    ref(el: HTMLElement) {
      // 记录DOM节点
      node.stateNode = el
      // 记录DOM节点和SlateNode节点映射关系
      ELEMENT_TO_NODE.set(el, node)

      return () => {
        node.stateNode = null
        ELEMENT_TO_NODE.delete(el)
      }
    },
  }

  return renderText({
    attributes,
    node,
    children: <span data-slate-leaf>{node.text}</span>,
  })
}

export default Text
