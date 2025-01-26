import React from 'react'
import { DOMEditor } from '@/libs/slate-dom/plugins/dom-editor'
import { BaseText, Text } from '@/libs/slate/interfaces/text'
import TextComponent from '@/libs/slate-react/components/Text'
import ElementComponent from '@/libs/slate-react/components/Element'
import { BaseElement } from '@/libs/slate/interfaces/element'
import { Editor } from '@/libs/slate/create-editor'

export function useChildren({ node }: { node: BaseElement | Editor }) {
  const children = []
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i]
    const key = DOMEditor.findKey(child)
    if (Text.isText(child)) {
      children.push(<TextComponent key={key.id} node={child as BaseText} />)
    } else {
      children.push(
        <ElementComponent key={key.id} node={child as BaseElement} />,
      )
    }
  }
  return children
}
