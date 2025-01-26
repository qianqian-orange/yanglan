export enum SlateNodeType {
  span = 'span',
  paragraph = 'paragraph',
  blockQuote = 'block-quote',
  bulletedList = 'bulleted-list',
  numberedList = 'numbered-list',
  listItem = 'list-item',
  headingOne = 'heading-one',
  headingTwo = 'heading-two',
}

export interface SlateNode {
  type: SlateNodeType
  key?: string
  text: string
  children: SlateNode[]
  return?: SlateNode
  bold?: boolean
  code?: boolean
  italic?: boolean
  underline?: boolean
  align?: 'left' | 'center' | 'right'
}
