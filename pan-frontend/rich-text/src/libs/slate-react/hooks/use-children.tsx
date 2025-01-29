import React from 'react'
import { uniqueId } from 'lodash-es'
import TextComponent from '@/libs/slate-react/components/text'
import ElementComponent from '@/libs/slate-react/components/element'
import SlateNode, { SlateNodeType } from '@/libs/slate/SlateNode'

export function useChildren({ node }: { node: SlateNode }) {
  const children = []
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children![i]
    child.path = node.type === SlateNodeType.div ? [i] : node.path.concat([i])
    // 建立父子关系索引
    child.parent = node
    // 获取key
    if (!child.key) child.key = uniqueId()
    // 文本节点
    if (child.type === SlateNodeType.span) {
      children.push(<TextComponent key={child.key} node={child} />)
    } else {
      children.push(<ElementComponent key={child.key} node={child} />)
    }
  }
  return children
}
