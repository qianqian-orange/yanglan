import SlateEditor from './SlateEditor'
import SlateNode from './SlateNode'

export const renderParagraph = (): SlateNode =>
  new SlateNode({
    tag: 'p',
    children: [
      new SlateNode({
        tag: 'span',
        text: '\uFEFF',
      }),
    ],
  })

export const renderPlaceholder = (): SlateNode =>
  new SlateNode({
    tag: 'p',
    children: [
      // \uFEFF代表非法字符即不可用字符，不会在页面上展示，作用是判断当前行是否为空
      new SlateNode({ tag: 'span', text: '\uFEFF' }),
      new SlateNode({
        tag: 'span',
        text: 'Enter some rich text…',
        style: {
          position: 'absolute',
          opacity: 0.3,
          pointerEvents: 'none', // 忽略鼠标点击事件
          userSelect: 'none', // 内容不可选中
        },
      }),
    ],
  })

export function createEditor(initialValue?: SlateNode[]): SlateEditor {
  const editor = new SlateEditor({
    slateRootNode: new SlateNode({
      tag: 'div',
      children: initialValue || [renderPlaceholder()],
    }),
  })
  return editor
}
