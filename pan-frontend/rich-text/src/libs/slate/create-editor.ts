import insertText from './editor/insert-text'
import deleteContentBackward from './editor/delete-content-backward'
import SlateEditor from './SlateEditor'
import SlateNode, { SlateNodeType } from './SlateNode'

export const noop = () => {}

export const renderPlaceholder = (): SlateNode => ({
  type: SlateNodeType.paragraph,
  path: [0],
  children: [
    {
      type: SlateNodeType.span,
      text: 'Enter some rich text…',
      children: [],
      path: [0, 0],
      className: 'editable-placeholder',
    },
    { type: SlateNodeType.span, text: '\uFEFF', path: [0, 1], children: [] },
  ],
})

export function createEditor(initialValue?: SlateNode[]): SlateEditor {
  const editor = new SlateEditor({
    domEl: null,
    slateRange: null,
    slateRootNode: {
      type: SlateNodeType.div,
      path: [],
      children: initialValue || [renderPlaceholder()],
    },
    forceUpdate: noop,
    insertText: (...args) => insertText(editor, ...args),
    deleteContentBackward: (...args) => deleteContentBackward(editor, ...args),
  })
  return editor
}
