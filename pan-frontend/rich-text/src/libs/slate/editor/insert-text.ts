import DOMEditor from '@/libs/slate-dom/dom-editor'
import Editor from '../Editor'
import { SlateNodeType } from '../SlateNode'

function insertText(editor: Editor, text: string, range: StaticRange) {
  const slateRange = (editor.slateRange = DOMEditor.toSlateRange(range))
  const { anchor, focus } = slateRange
  const { startContainer, startOffset } = range
  const slateNode = DOMEditor.toSlateNode(startContainer)
  // placeholder处理逻辑
  if (slateNode.text!.startsWith('\uFEFF')) {
    slateNode.parent!.children = [
      { type: SlateNodeType.span, text, path: [0, 0] },
    ]
    anchor.path[1] = focus.path[1] = 0
    editor.forceUpdate()
    return
  }
  const before = slateNode.text!.slice(0, startOffset)
  const after = slateNode.text!.slice(startOffset)
  slateNode.text = before + text + after
  anchor.offset += 1
  focus.offset += 1
  editor.forceUpdate()
}

export default insertText
