import { ELEMENT_TO_NODE } from '@/libs/slate-dom/utils/weak-maps'
import { Editor } from '../create-editor'
import { isDOMElement } from '@/libs/slate-dom/utils/dom'
import { SlateNodeType } from '../interfaces/node'

function insertText(editor: Editor, text: string, range: StaticRange) {
  const { slateRootNode } = editor
  if (!slateRootNode.children.length) {
    const child = { type: SlateNodeType.span, text, children: [] }
    const parent = {
      type: SlateNodeType.paragraph,
      text: '',
      children: [child],
    }
    slateRootNode.children.push(parent)
    editor.forceUpdate()
    return
  }
  const { startContainer, startOffset } = range
  const parentNode = isDOMElement(startContainer)
    ? startContainer
    : startContainer.parentNode
  if (!parentNode) return
  const textNode = (parentNode as HTMLElement).closest(
    '[data-slate-node="text"]',
  )
  if (!textNode) return
  const slateNode = ELEMENT_TO_NODE.get(textNode)
  if (!slateNode) return
  const before = slateNode.text.slice(0, startOffset)
  const after = slateNode.text.slice(startOffset)
  slateNode.text = before + text + after
  editor.forceUpdate()
}

export default insertText
