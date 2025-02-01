import { CSSProperties, JSX } from 'react'
import { uniqueId } from 'lodash-es'
import { isDOMElement } from '../slate-dom/utils/dom'

export const NoFlags = 0
export const TextAlignLeft = /*                       */ 0b0000000000000000000000000001 // 1
export const TextAlignCenter = /*                     */ 0b0000000000000000000000000010 // 2
export const TextAlignRight = /*                      */ 0b0000000000000000000000000100 // 4
export const TextAlignJustify = /*                    */ 0b0000000000000000000000001000 // 8
export const HeadingOne = /*                                  */ 0b0000000000000000000000010000 // 16
export const HeadingTwo = /*                                  */ 0b0000000000000000000000100000 // 32
export const BlockQuote = /*                          */ 0b0000000000000000000001000000 // 64
export const NumberedList = /*                        */ 0b0000000000000000000010000000 // 128
export const BulletedList = /*                        */ 0b0000000000000000000100000000 // 256
export const Bold = /*                                */ 0b0000000000000000001000000000 // 512
export const Italic = /*                              */ 0b0000000000000000010000000000 // 1024
export const Underline = /*                           */ 0b0000000000000000100000000000 // 2048
export const Code = /*                                */ 0b0000000000000001000000000000 // 4096
export const HasTextAlign =
  TextAlignLeft | TextAlignCenter | TextAlignRight | TextAlignJustify
export const HasBlockElement =
  HeadingOne | HeadingTwo | BlockQuote | NumberedList | BulletedList

// dom节点与slateNode节点映射关系
export const ELEMENT_TO_NODE: WeakMap<Node, SlateNode> = new WeakMap()

type Prop = 'textAlign' | 'bold' | 'italic' | 'underline' | 'code'

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
  flags: number // 副作用，如加粗，斜体
  attributes: {
    className?: string // class类名
    style?: CSSProperties // style样式
    contentEditable?: boolean // 是否可编辑
  }

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
    flags = NoFlags,
    attributes = {},
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
    this.flags = flags
    this.attributes = attributes
  }

  isEmpty() {
    return this.text.startsWith('\uFEFF')
  }

  string() {
    return this.children.map((child) => child.text).join('')
  }

  addFlag(flag: number, resetFlag: number) {
    if (this.flags & flag) this.flags &= ~flag
    else {
      this.flags &= ~resetFlag
      this.flags |= flag
    }
  }

  setProps(keys: Prop[]) {
    keys.forEach((key) => {
      switch (key) {
        case 'textAlign': {
          let textAlign: CSSProperties['textAlign']
          // 更改style属性值
          switch (this.flags & HasTextAlign) {
            case TextAlignLeft:
              textAlign = 'left'
              break
            case TextAlignCenter:
              textAlign = 'center'
              break
            case TextAlignRight:
              textAlign = 'right'
              break
            case TextAlignJustify:
              textAlign = 'justify'
              break
          }
          this.attributes.style = { textAlign }
          break
        }
        case 'bold':
          this.bold = Boolean(this.flags & Bold)
          break
        case 'italic':
          this.italic = Boolean(this.flags & Italic)
          break
        case 'underline':
          this.underline = Boolean(this.flags & Underline)
          break
        case 'code':
          this.code = Boolean(this.flags & Code)
          break
      }
    })
  }

  // 获取DOM节点对应的SlateNode节点
  static toSlateNodeByEl(el: Node): SlateNode {
    el = isDOMElement(el) ? el : el.parentNode!
    el = (el as HTMLElement).closest('[data-slate-node="text"]')!
    const slateNode = ELEMENT_TO_NODE.get(el)!
    return slateNode
  }

  static toSlateNodeByPath(slateNode: SlateNode, path: number[]): SlateNode {
    for (let i = 0; i < path.length; i++) {
      slateNode = slateNode.children[path[i]]
    }
    return slateNode
  }
}

export default SlateNode
