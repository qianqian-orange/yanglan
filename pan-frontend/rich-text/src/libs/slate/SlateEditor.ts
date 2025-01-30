import { ActionDispatch, AnyActionArg } from 'react'
import { noop } from 'lodash-es'
import SlateNode from './SlateNode'
import SlateRange from './SlateRange'
import { renderParagraph, renderPlaceholder } from './create-editor'

class SlateEditor {
  domEl: HTMLElement | null // 编辑容器节点
  slateRootNode: SlateNode // SlateNode Tree根节点
  slateRange: SlateRange | null // 对标StaticRange对象，有两个属性，anchor是选择区域开始锚点，focus是选择区域结束锚点
  forceUpdate: ActionDispatch<AnyActionArg> // 触发更新渲染

  constructor({
    domEl = null,
    slateRange = null,
    slateRootNode = new SlateNode({ tag: 'div' }),
    forceUpdate = noop,
  }: Partial<SlateEditor>) {
    this.domEl = domEl
    this.slateRange = slateRange
    this.slateRootNode = slateRootNode
    this.forceUpdate = forceUpdate
  }

  // 插入文本
  public insertText(text: string, range: StaticRange) {
    // 创建StaticRange对象对应的SlateRange对象
    this.slateRange = SlateRange.toSlateRange(range)
    // anchor为选择区域开始锚点，focus为选择区域结束锚点
    const { anchor, focus } = this.slateRange
    const { startContainer, startOffset } = range
    // 获取开始锚点对应的SlateNode节点
    const slateNode = SlateNode.toSlateNodeByEl(startContainer)
    // 如果文本内容以\uFEFF开头，说明当前行没有输入内容，则直接替换成输入文本内容即可
    if (slateNode.text.startsWith('\uFEFF')) {
      slateNode.parent!.children = [
        new SlateNode({
          tag: 'span',
          text,
        }),
      ]
      this.forceUpdate()
      return
    }
    const before = slateNode.text.slice(0, startOffset)
    const after = slateNode.text.slice(startOffset)
    slateNode.text = before + text + after
    anchor.offset += 1
    focus.offset += 1
    this.forceUpdate()
  }

  // 插入行
  public insertParagraph(range: StaticRange) {
    this.slateRange = SlateRange.toSlateRange(range)
    // 占位处理逻辑
    const firstParagraph = this.slateRootNode.children[0]
    if (
      firstParagraph.children[0].text.startsWith('\uFEFF') &&
      firstParagraph.children.length > 1
    ) {
      firstParagraph.children.pop()
    }
    const { anchor, focus } = this.slateRange
    // 获取换行文本内容
    // let text = ''
    let slateNode = this.slateRootNode
    for (let i = 0; i < anchor.path.length; i++) {
      slateNode = slateNode.children[anchor.path[i]]
    }
    console.log(slateNode)
    // 行坐标
    const linelocation = anchor.path[0] + 1
    const before = this.slateRootNode.children.slice(0, linelocation)
    const after = this.slateRootNode.children.slice(linelocation)
    this.slateRootNode.children = [...before, renderParagraph(), ...after]
    anchor.path = focus.path = [linelocation, 0]
    anchor.offset = focus.offset = 1
    this.forceUpdate()
  }

  // 删除文本
  public deleteContentBackward(range: StaticRange) {
    this.slateRange = SlateRange.toSlateRange(range)
    const { anchor, focus } = this.slateRange
    const { startContainer, startOffset, endOffset } = range
    const slateNode = SlateNode.toSlateNodeByEl(startContainer)
    if (slateNode.text.startsWith('\uFEFF')) {
      return
    }
    const before = slateNode.text.slice(0, startOffset)
    const after = slateNode.text.slice(endOffset)
    slateNode.text = before + after
    if (slateNode.text) {
      const length = endOffset - startOffset
      focus.offset -= length
      this.forceUpdate()
      return
    }
    const parent = slateNode.parent!
    parent.children.splice(parent.children.indexOf(slateNode), 1)
    if (parent.children.length === 0) {
      parent.children = renderPlaceholder().children
      anchor.offset = focus.offset = 1
    }
    this.forceUpdate()
  }
}

export default SlateEditor
