import React from 'react'
import TextComponent from '@/libs/slate-react/components/text'
import ElementComponent from '@/libs/slate-react/components/element'
import SlateNode from '@/libs/slate/SlateNode'

export function useChildren({ node }: { node: SlateNode }) {
  const children = []
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i]
    // 计算节点路径
    child.path = node.tag === 'div' ? [i] : node.path.concat([i])
    // 建立父子关系索引
    child.parent = node
    if (child.tag === 'span') {
      // 行内元素节点
      children.push(<TextComponent key={child.key} node={child} />)
    } else {
      // 块级元素节点
      children.push(<ElementComponent key={child.key} node={child} />)
    }
  }
  return children
}
