import React, { PropsWithChildren, CSSProperties, ElementType } from 'react'
import { useChildren } from '../hooks/use-children'
import { ELEMENT_TO_NODE } from '@/libs/slate-dom/utils/weak-maps'
import SlateNode from '@/libs/slate/SlateNode'

function renderElement({
  attributes,
  node,
  children,
}: PropsWithChildren<{
  attributes: { [key: string]: unknown }
  node: SlateNode
}>) {
  const style = { textAlign: node.align } as CSSProperties
  let Component: ElementType = 'p'
  switch (node.type) {
    case 'block-quote':
      Component = 'blockquote'
      break
    case 'bulleted-list':
      Component = 'ul'
      break
    case 'numbered-list':
      Component = 'ol'
      break
    case 'list-item':
      Component = 'li'
      break
    case 'heading-one':
      Component = 'h1'
      break
    case 'heading-two':
      Component = 'h2'
      break
    default:
      Component = 'p'
      break
  }
  return (
    <Component style={style} {...attributes}>
      {children}
    </Component>
  )
}

function Element({ node }: { node: SlateNode }) {
  const children = useChildren({ node })

  const attributes = {
    'data-slate-node': 'element',
    ref(el: HTMLElement) {
      node.stateNode = el
      ELEMENT_TO_NODE.set(el, node)

      return () => {
        delete node.stateNode
        ELEMENT_TO_NODE.delete(el)
      }
    },
  }

  return renderElement({ attributes, children, node })
}

export default Element
