import { CSSProperties, JSX } from 'react'
import { uniqueId } from 'lodash-es'
import { isDOMElement } from '../slate-dom/utils/dom'
import SlatePoint from './SlatePoint'

// dom节点与slateNode节点映射关系
export const ELEMENT_TO_NODE: WeakMap<Node, SlateNode> = new WeakMap()

class SlateNode {
  tag: keyof JSX.IntrinsicElements // 节点标签类型
  key: string // 唯一标识
  text: string // 文本内容
  children: SlateNode[] // 子节点
  parent: SlateNode | null // 父节点
  stateNode: HTMLElement | null // DOM节点
  path: number[] // 节点路径
  bold?: boolean // 是否加粗
  code?: boolean // 是否是代码块
  italic?: boolean // 是否是斜体
  underline?: boolean // 是否有下划线
  align?: 'left' | 'center' | 'right' // 文本水平位置
  className?: string // class类名
  style?: CSSProperties // style样式

  constructor({
    tag = 'div',
    key = uniqueId(),
    text = '',
    children = [],
    parent = null,
    stateNode = null,
    path = [],
    bold,
    code,
    italic,
    underline,
    align,
    className,
    style,
  }: Partial<SlateNode>) {
    this.tag = tag
    this.key = key
    this.text = text
    this.children = children
    this.parent = parent
    this.stateNode = stateNode
    this.path = path
    this.bold = bold
    this.code = code
    this.italic = italic
    this.underline = underline
    this.align = align
    this.className = className
    this.style = style
  }

  // 获取DOM节点对应的SlateNode节点
  static toSlateNodeByEl(el: Node): SlateNode {
    el = isDOMElement(el) ? el : el.parentNode!
    el = (el as HTMLElement).closest('[data-slate-node="text"]')!
    const slateNode = ELEMENT_TO_NODE.get(el)!
    return slateNode
  }

  static toSlateNodeByPoint(
    slateNode: SlateNode,
    point: SlatePoint,
  ): SlateNode {
    const { path } = point
    for (let i = 0; i < path.length; i++) {
      slateNode = slateNode.children[path[i]]
    }
    return slateNode
  }
}

export default SlateNode
