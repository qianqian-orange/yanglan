import React from 'react'
import { JsonNode } from '../object/json-node'
import { Text } from '../components/preview/text'
import { Element } from '../components/preview/element'

export function useChildren({ node }: { node: JsonNode }) {
  const children = []
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i]
    if (child.tag === 'span') {
      // 行内元素节点
      children.push(<Text key={child.key} node={child} />)
    } else {
      // 块级元素节点
      children.push(<Element key={child.key} node={child} />)
    }
  }
  return children
}
