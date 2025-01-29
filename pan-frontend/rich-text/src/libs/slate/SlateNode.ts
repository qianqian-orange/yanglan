export enum SlateNodeType {
  div = 'div',
  span = 'span',
  paragraph = 'paragraph',
  blockQuote = 'block-quote',
  bulletedList = 'bulleted-list',
  numberedList = 'numbered-list',
  listItem = 'list-item',
  headingOne = 'heading-one',
  headingTwo = 'heading-two',
}

class SlateNode {
  type: SlateNodeType
  key?: string
  text?: string
  children: SlateNode[] // 子节点
  parent?: SlateNode // 父节点
  stateNode?: HTMLElement // DOM节点
  path: number[] // 节点路径
  bold?: boolean // 是否加粗
  code?: boolean // 是否是代码块
  italic?: boolean // 是否是斜体
  underline?: boolean // 是否有下划线
  align?: 'left' | 'center' | 'right'
  className?: string

  constructor({
    type,
    key,
    text,
    children,
    parent,
    stateNode,
    path,
    bold,
    code,
    italic,
    underline,
    align,
    className,
  }: SlateNode) {
    this.type = type
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
  }
}

export default SlateNode
