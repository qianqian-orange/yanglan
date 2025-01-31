import React, { PropsWithChildren, CSSProperties } from 'react'
import { useChildren } from '../hooks/use-children'
import SlateNode, { ELEMENT_TO_NODE } from '@/libs/slate/SlateNode'

function renderElement({
  attributes,
  node,
  children,
}: PropsWithChildren<{
  attributes: { [key: string]: unknown }
  node: SlateNode
}>) {
  const style = { textAlign: node.align } as CSSProperties
  // 元素标签
  const Component = node.tag

  return (
    <Component style={style} {...attributes}>
      {children}
    </Component>
  )
}

function Element({ node }: { node: SlateNode }) {
  const children = useChildren({ node })

  const attributes = {
    ...node.attributes,
    'data-slate-node': 'element',
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

  return renderElement({ attributes, children, node })
}

export default Element
