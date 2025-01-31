import { ActionDispatch, AnyActionArg } from 'react'
import { noop } from 'lodash-es'
import SlateNode from './SlateNode'
import SlateSelection from './SlateSelection'
import { renderParagraph, renderPlaceholder } from './create-editor'

class SlateEditor {
  domEl: HTMLElement | null // 编辑容器节点
  slateRootNode: SlateNode // SlateNode Tree根节点
  slateSelection: SlateSelection | null // 对标Selection对象，有两个属性，anchor是选择区域开始锚点，focus是选择区域结束锚点
  marks: Set<string> // 记录操作栏中已选操作
  forceUpdate: ActionDispatch<AnyActionArg> // 触发更新渲染

  constructor({
    domEl = null,
    slateSelection = null,
    slateRootNode = new SlateNode({ tag: 'div' }),
    marks = new Set(),
    forceUpdate = noop,
  }: Partial<SlateEditor>) {
    this.domEl = domEl
    this.slateSelection = slateSelection
    this.slateRootNode = slateRootNode
    this.marks = marks
    this.forceUpdate = forceUpdate
  }

  // 插入文本
  public insertText(text: string) {
    // anchor为选择区域开始锚点，focus为选择区域结束锚点
    const { anchor, focus } = this.slateSelection!
    // 获取开始锚点对应的SlateNode节点
    const slateNode = SlateNode.toSlateNodeByPath(
      this.slateRootNode,
      anchor.path,
    )
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
    // 获取光标前半部分文本
    const before = slateNode.text.slice(0, anchor.offset)
    // 获取光标后半部分文本
    const after = slateNode.text.slice(anchor.offset)
    // 将输入文本插入到光标位置
    slateNode.text = before + text + after
    anchor.offset += 1
    focus.offset += 1
    this.forceUpdate()
  }

  // 插入行
  public insertParagraph() {
    // 占位处理逻辑
    const firstParagraph = this.slateRootNode.children[0]
    if (
      firstParagraph.children.length > 1 &&
      firstParagraph.children[0].text.startsWith('\uFEFF')
    ) {
      firstParagraph.children.pop()
    }
    const { anchor, focus } = this.slateSelection!
    // 获取换行文本内容
    let text = ''
    // 开始锚点对应的SlateNode节点
    const slateNode = SlateNode.toSlateNodeByPath(
      this.slateRootNode,
      anchor.path,
    )
    text += slateNode.text.slice(anchor.offset)
    slateNode.text = slateNode.text.slice(0, anchor.offset)
    const parent = slateNode.parent!
    const children = parent.children.splice(
      slateNode.path[slateNode.path.length - 1] + 1,
    )
    for (let i = 0; i < children.length; i++) {
      text += children[i].text
    }
    // 如果当前行文本为空则赋值为\uFEFF
    if (parent.children.length === 1 && !parent.children[0].text)
      parent.children = renderParagraph().children
    // 新行坐标
    const paragraphLocation = anchor.path[0] + 1
    const before = this.slateRootNode.children.slice(0, paragraphLocation)
    const after = this.slateRootNode.children.slice(paragraphLocation)
    this.slateRootNode.children = [...before, renderParagraph(text), ...after]
    anchor.path = focus.path = [paragraphLocation, 0]
    anchor.offset = focus.offset = 0
    this.forceUpdate()
  }

  // 删除文本
  public deleteContentBackward() {
    const { anchor, focus } = this.slateSelection!
    const slateNode = SlateNode.toSlateNodeByPath(
      this.slateRootNode,
      anchor.path,
    )
    // 当前行开头删除处理逻辑
    if (slateNode.text.startsWith('\uFEFF') || !anchor.offset) {
      // 当前行坐标
      const paragraphLocation = anchor.path[0]
      if (paragraphLocation === 0) return
      const [paragraph] = this.slateRootNode.children.splice(
        paragraphLocation,
        1,
      )
      // 获取当前行文本内容
      let text = ''
      for (let i = 0; i < paragraph.children.length; i++) {
        text += paragraph.children[i].text
      }
      const prevParagraph = this.slateRootNode.children[paragraphLocation - 1]
      const lastChildIndex = prevParagraph.children.length - 1
      const lastChild = prevParagraph.children[lastChildIndex]
      lastChild.text = lastChild.text.startsWith('\uFEFF')
        ? text
        : lastChild.text + text
      // 如果只有一个子节点且文本内容为空则展示占位节点
      if (
        this.slateRootNode.children.length === 1 &&
        lastChild.text.startsWith('\uFEFF')
      ) {
        prevParagraph.children = renderPlaceholder().children
        anchor.offset = focus.offset = 1
        anchor.path = focus.path = [0, 0]
      } else {
        anchor.offset = focus.offset = lastChild.text.length - text.length
        anchor.path = focus.path = [paragraphLocation - 1, lastChildIndex]
      }
      this.forceUpdate()
      return
    }
    // 获取光标前半部分文本
    const before = slateNode.text.slice(0, anchor.offset - 1)
    // 获取光标后半部分文本
    const after = slateNode.text.slice(anchor.offset)
    slateNode.text = before + after
    if (slateNode.text) {
      anchor.offset -= 1
      focus.offset -= 1
      this.forceUpdate()
      return
    }
    const parent = slateNode.parent!
    parent.children.splice(parent.children.indexOf(slateNode), 1)
    if (!parent.children.length) {
      parent.children =
        this.slateRootNode.children.length === 1
          ? renderPlaceholder().children
          : renderParagraph().children
      anchor.offset = focus.offset = 1
    }
    this.forceUpdate()
  }

  // 处理操作栏操作逻辑
  public addMark(key: string) {
    const { anchor, focus } = this.slateSelection!
    if (this.marks.has(key)) this.marks.delete(key)
    else this.marks.add(key)
    switch (key) {
      case 'h1':
      case 'h2':
      case 'blockquote':
      case 'ol':
      case 'ul': {
        for (let i = anchor.path[0]; i <= focus.path[0]; i++) {
          const slateNode = SlateNode.toSlateNodeByPath(this.slateRootNode, [i])
          slateNode.tag = key
        }
        break
      }
    }
    this.forceUpdate()
  }
}

export default SlateEditor
