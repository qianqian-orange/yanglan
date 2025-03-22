import SlateEditor from './SlateEditor'
import SlateNode from './SlateNode'

export const renderList = (props: Partial<SlateNode> = {}): SlateNode =>
  new SlateNode(props)

export const renderListItem = (props: Partial<SlateNode> = {}): SlateNode => {
  const slateNode = new SlateNode({
    tag: 'li',
    ...props,
  })
  slateNode.setProps(['textAlign'])
  return slateNode
}

export const renderText = ({
  text = '',
  ...rest
}: Partial<SlateNode> = {}): SlateNode => {
  const slateNode = new SlateNode({
    tag: 'span',
    text: text || '\uFEFF',
    ...rest,
  })
  slateNode.setProps(['bold', 'italic', 'underline', 'code'])
  return slateNode
}

export const renderParagraph = ({
  tag = 'p',
  children = [renderText()],
  ...rest
}: Partial<SlateNode> = {}): SlateNode => {
  const slateNode = new SlateNode({
    tag,
    children,
    ...rest,
  })
  slateNode.setProps(['textAlign'])
  return slateNode
}

export const renderPlaceholder = (): SlateNode =>
  new SlateNode({
    tag: 'p',
    children: [
      // \uFEFF代表非法字符即不可用字符，不会在页面上展示，作用是判断当前行是否为空
      renderText(),
      renderText({
        text: 'Enter some rich text…',
        attributes: {
          style: {
            position: 'absolute',
            top: 0,
            left: 0,
            opacity: 0.3,
            pointerEvents: 'none', // 忽略鼠标点击事件
            userSelect: 'none', // 内容不可选中
          },
          contentEditable: false,
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
