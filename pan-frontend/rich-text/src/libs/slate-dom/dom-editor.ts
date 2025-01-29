import SlateEditor, { SlatePoint, SlateRange } from '../slate/SlateEditor'
import SlateNode from '../slate/SlateNode'
import { isDOMElement } from './utils/dom'
import { ELEMENT_TO_NODE } from './utils/weak-maps'

const DOMEditor = {
  // 获取DOM节点对应的SlateNode节点
  toSlateNode(domNode: Node): SlateNode {
    domNode = isDOMElement(domNode) ? domNode : domNode.parentNode!
    domNode = (domNode as HTMLElement).closest('[data-slate-node="text"]')!
    const slateNode = ELEMENT_TO_NODE.get(domNode)!
    return slateNode
  },
  toSlatePoint(domNode: Node, offset: number): SlatePoint {
    const slateNode = DOMEditor.toSlateNode(domNode)
    return { path: slateNode.path, offset }
  },
  // 获取SlateRange
  toSlateRange(range: StaticRange): SlateRange {
    const { startContainer, startOffset, endContainer, endOffset } = range
    const anchor = DOMEditor.toSlatePoint(startContainer, startOffset)
    const focus = DOMEditor.toSlatePoint(endContainer, endOffset)
    return { anchor, focus }
  },
  toDOMPoint(editor: SlateEditor, point: SlatePoint): [Node, number] {
    let domNode: Node = editor.domEl!
    const { path, offset } = point
    for (let i = 0; i < path.length; i++) {
      domNode = domNode.childNodes[path[i]]
    }
    domNode = (domNode as HTMLElement).querySelector('[data-slate-string]')!
      .childNodes[0]
    return [domNode, offset]
  },
  // 获取StaticRange
  toDOMRange(editor: SlateEditor): StaticRange {
    const { anchor, focus } = editor.slateRange!
    const [startContainer, startOffset] = DOMEditor.toDOMPoint(editor, anchor)
    const [endContainer, endOffset] = DOMEditor.toDOMPoint(editor, focus)
    const range = new StaticRange({
      startContainer,
      startOffset,
      endContainer,
      endOffset,
    })
    return range
  },
}

export default DOMEditor
