import DOMEditor from '@/libs/slate-dom/dom-editor'
import Editor from '../Editor'
import { renderPlaceholder } from '../create-editor'

function deleteContentBackward(editor: Editor, range: StaticRange) {
  const slateRange = (editor.slateRange = DOMEditor.toSlateRange(range))
  const { anchor, focus } = slateRange
  const { startContainer, startOffset, endOffset } = range
  const slateNode = DOMEditor.toSlateNode(startContainer)
  if (slateNode.text!.startsWith('\uFEFF')) {
    return
  }
  const before = slateNode.text!.slice(0, startOffset)
  const after = slateNode.text!.slice(endOffset)
  slateNode.text = before + after
  if (slateNode.text) {
    const length = endOffset - startOffset
    focus.offset -= length
    editor.forceUpdate()
    return
  }
  const parent = slateNode.parent!
  parent.children!.splice(parent.children!.indexOf(slateNode), 1)
  if (parent.children!.length === 0) {
    parent.children = renderPlaceholder().children
    anchor.path = focus.path = [0, 1]
    anchor.offset = focus.offset = 1
  }
  editor.forceUpdate()
}

export default deleteContentBackward
