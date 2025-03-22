import { ActionDispatch, AnyActionArg, JSX } from 'react'
import { noop } from 'lodash-es'
import SlateNode, {
  BlockQuote,
  Bold,
  BulletedList,
  Code,
  HasBlockElement,
  HasTextAlign,
  HeadingOne,
  HeadingTwo,
  Italic,
  NoFlags,
  NumberedList,
  TextAlignCenter,
  TextAlignJustify,
  TextAlignLeft,
  TextAlignRight,
  Underline,
} from './SlateNode'
import SlateSelection from './SlateSelection'
import {
  renderList,
  renderListItem,
  renderParagraph,
  renderPlaceholder,
  renderText,
} from './create-editor'

class SlateEditor {
  domEl: HTMLElement | null // 编辑容器节点
  slateRootNode: SlateNode // SlateNode Tree根节点
  slateSelection: SlateSelection | null // 对标Selection对象，有两个属性，anchor是选择区域开始锚点，focus是选择区域结束锚点
  flags: number
  forceUpdate: ActionDispatch<AnyActionArg> // 触发更新渲染

  constructor({
    domEl = null,
    slateSelection = null,
    slateRootNode = new SlateNode({ tag: 'div' }),
    flags = NoFlags,
    forceUpdate = noop,
  }: Partial<SlateEditor>) {
    this.domEl = domEl
    this.slateSelection = slateSelection
    this.slateRootNode = slateRootNode
    this.flags = flags
    this.forceUpdate = forceUpdate
  }

  isEmpty() {
    const length = this.slateRootNode.children.length
    if (length > 1 || this.flags !== NoFlags) return false
    if (length === 0) return true
    const paragraph = this.slateRootNode.children[0]
    return paragraph.children.length === 0 || paragraph.children[0].isEmpty()
  }

  isShowPlaceholder() {
    if (!this.isEmpty()) return false
    const paragraph = this.slateRootNode.children[0]
    return paragraph.children.length > 1
  }

  renderPlaceholder() {
    if (this.isShowPlaceholder()) return
    const paragraph = this.slateRootNode.children[0]
    paragraph.children = renderPlaceholder().children
  }

  removePlaceholder() {
    if (!this.isShowPlaceholder()) return
    const paragraph = this.slateRootNode.children[0]
    paragraph.children.pop()
  }

  bubbleProperties() {
    const { anchor } = this.slateSelection!
    // 将当前副作用清空重新收集
    this.flags = NoFlags
    let slateNode = this.slateRootNode
    for (let i = 0; i < anchor.path.length; i++) {
      slateNode = slateNode.children[anchor.path[i]]
      this.flags |= slateNode.flags
    }
  }

  // 插入文本
  public insertText(text: string) {
    // 移除占位节点
    this.removePlaceholder()
    // anchor为选择区域开始锚点，focus为选择区域结束锚点
    const { anchor, focus } = this.slateSelection!
    // 获取开始锚点对应的SlateNode节点
    const slateNode = SlateNode.toSlateNodeByPath(
      this.slateRootNode,
      anchor.path,
    )
    // 如果文本内容以\uFEFF开头，直接替换成输入文本内容即可
    if (slateNode.isEmpty()) {
      slateNode.text = text
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
    // 移除占位节点
    this.removePlaceholder()
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
    const parentNode = slateNode.parent!
    const childrenList = parentNode.children.splice(
      slateNode.path[slateNode.path.length - 1] + 1,
    )
    childrenList.unshift(renderText({ flags: slateNode.flags, text }))
    // 如果当前行文本为空则赋值为\uFEFF
    if (parentNode.children.length === 1 && !parentNode.children[0].text)
      parentNode.children = renderParagraph().children
    // 新行坐标
    const paragraphLocation = parentNode.path[parentNode.path.length - 1] + 1
    // 当前行根节点
    const rootNode = parentNode.parent!
    const before = rootNode.children.slice(0, paragraphLocation)
    const after = rootNode.children.slice(paragraphLocation)
    const children = ['ol', 'ul'].includes(rootNode.tag)
      ? renderListItem({
          flags: parentNode.flags,
          children: childrenList,
          path: [...rootNode.path, paragraphLocation],
        })
      : renderParagraph({
          tag: parentNode.tag,
          flags: parentNode.flags,
          children: childrenList,
          path: [...rootNode.path, paragraphLocation],
        })
    rootNode.children = [...before, children, ...after]
    anchor.path = focus.path = [...children.path, 0]
    anchor.offset = focus.offset = 0
    this.forceUpdate()
  }

  // 删除文本
  public deleteContentBackward() {
    if (this.isEmpty()) return
    const { anchor, focus } = this.slateSelection!
    let slateNode = SlateNode.toSlateNodeByPath(this.slateRootNode, anchor.path)
    const parentNode = slateNode.parent!
    const rootNode = parentNode.parent!
    // 当前行开头删除处理逻辑
    if (slateNode.isEmpty() || !anchor.offset) {
      // 在首行开头则直接跳过
      if (anchor.path.every(p => p === 0)) return
      // 当前行坐标
      const paragraphLocation = parentNode.path[parentNode.path.length - 1]
      const [paragraph] = rootNode.children.splice(paragraphLocation, 1)
      if (!rootNode.children.length)
        this.slateRootNode.children.splice(rootNode.path[0], 1)
      // 获取当前行文本内容
      const text = paragraph.isEmpty() ? '' : paragraph.string()
      const prevParagraph =
        paragraphLocation === 0
          ? this.slateRootNode.children[rootNode.path[0] - 1]
          : rootNode.children[paragraphLocation - 1]
      let lastChild = prevParagraph
      while (lastChild.tag !== 'span')
        lastChild = lastChild.children[lastChild.children.length - 1]
      lastChild.text =
        text && lastChild.isEmpty() ? text : lastChild.text + text
      if (this.isEmpty()) this.renderPlaceholder()
      anchor.path = focus.path = lastChild.path
      anchor.offset = focus.offset = lastChild.text.length - text.length
      this.bubbleProperties()
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
    parentNode.children.splice(parentNode.children.indexOf(slateNode), 1)
    if (!parentNode.children.length) {
      if (this.isEmpty()) this.renderPlaceholder()
      else parentNode.children = renderParagraph().children
      anchor.offset = focus.offset = 1
    } else {
      // 移动到上一个子节点
      anchor.path[anchor.path.length - 1] -= 1
      focus.path[focus.path.length - 1] -= 1
      slateNode = SlateNode.toSlateNodeByPath(this.slateRootNode, anchor.path)
      anchor.offset = focus.offset = slateNode.text.length
    }
    this.bubbleProperties()
    this.forceUpdate()
  }

  // 处理操作栏操作逻辑
  public addFlag(flag: number) {
    // 移除占位节点
    this.removePlaceholder()
    const { anchor, focus } = this.slateSelection!
    switch (flag) {
      case TextAlignLeft:
      case TextAlignCenter:
      case TextAlignRight:
      case TextAlignJustify: {
        const slateNode = SlateNode.toSlateNodeByPath(
          this.slateRootNode,
          anchor.path,
        )
        const parentNode = slateNode.parent!
        parentNode.addFlag(flag, HasTextAlign)
        parentNode.setProps(['textAlign'])
        break
      }
      case Bold:
      case Italic:
      case Underline:
      case Code: {
        const slateNode = SlateNode.toSlateNodeByPath(
          this.slateRootNode,
          anchor.path,
        )
        slateNode.addFlag(flag, NoFlags)
        slateNode.setProps(['bold', 'italic', 'underline', 'code'])
        break
      }
      case HeadingOne:
      case HeadingTwo:
      case BlockQuote:
      case NumberedList:
      case BulletedList: {
        let tag: keyof JSX.IntrinsicElements = 'p'
        switch (flag) {
          case HeadingOne:
            tag = 'h1'
            break
          case HeadingTwo:
            tag = 'h2'
            break
          case BlockQuote:
            tag = 'blockquote'
            break
          case NumberedList:
            tag = 'ol'
            break
          case BulletedList:
            tag = 'ul'
            break
        }
        const slateNode = SlateNode.toSlateNodeByPath(this.slateRootNode, [
          anchor.path[0],
        ])
        if (['p', 'h1', 'h2', 'blockquote'].includes(slateNode.tag)) {
          slateNode.addFlag(flag, HasBlockElement)
          slateNode.tag = slateNode.flags & flag ? tag : 'p'
          if (['ol', 'ul'].includes(slateNode.tag)) {
            slateNode.children = [
              renderListItem({
                flags: slateNode.flags & HasTextAlign,
                children: slateNode.children,
              }),
            ]
            slateNode.flags &= ~HasTextAlign
            slateNode.setProps(['textAlign'])
          }
          break
        }
        const parentIndex = anchor.path[0]
        const childIndex = anchor.path[1]
        let children = slateNode.children[childIndex]
        const childrenList = slateNode.children.splice(childIndex + 1)
        // 移除当前li节点
        slateNode.children.pop()
        // 如果当前节点tag和新tag一致，则将该li元素切换成p元素
        if (slateNode.tag === tag) {
          children.tag = 'p'
          children.addFlag(NoFlags, HasBlockElement)
        }
        // 如果新tag属于h1、h2、blockquote，那切换成对应的tag元素
        else if (['h1', 'h2', 'blockquote'].includes(tag)) {
          children.tag = tag
          children.addFlag(flag, HasBlockElement)
        } else {
          children = renderList({
            tag: tag,
            flags: tag === 'ol' ? NumberedList : BulletedList,
            children: [children],
          })
        }
        this.slateRootNode.children = [
          ...this.slateRootNode.children.slice(0, parentIndex),
          ...(slateNode.children.length ? [slateNode] : []),
          children,
          ...(childrenList.length
            ? [
                renderList({
                  tag: slateNode.tag,
                  flags: slateNode.flags,
                  children: childrenList,
                }),
              ]
            : []),
          ...this.slateRootNode.children.slice(parentIndex + 1),
        ]
        anchor.path = focus.path = [
          slateNode.children.length ? parentIndex + 1 : parentIndex,
          0,
          ...(slateNode.tag === tag || ['h1', 'h2', 'blockquote'].includes(tag)
            ? []
            : [0]),
        ]
        break
      }
    }
    // 收集子树副作用
    this.bubbleProperties()
    if (this.flags === NoFlags && this.isEmpty()) this.renderPlaceholder()
    this.forceUpdate()
  }
}

export default SlateEditor
