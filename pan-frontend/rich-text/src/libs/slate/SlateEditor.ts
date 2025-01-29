import { ActionDispatch, AnyActionArg } from 'react'
import SlateNode from './SlateNode'

export interface SlatePoint {
  path: number[] // 节点路径
  offset: number // 偏移距离
}

export interface SlateRange {
  anchor: SlatePoint // 选择区域开始锚点
  focus: SlatePoint // 选择区域结束锚点
}

class SlateEditor {
  domEl: HTMLElement | null // 编辑容器节点
  slateRootNode: SlateNode // SlateNode Tree根节点
  slateRange: SlateRange | null // 对标StaticRange对象，有两个属性，anchor是选择区域开始锚点，focus是选择区域结束锚点
  forceUpdate: ActionDispatch<AnyActionArg> // 触发更新渲染
  insertText: (text: string, range: StaticRange) => void // 插入文本
  deleteContentBackward: (range: StaticRange) => void // 删除文本

  constructor({
    domEl,
    slateRange,
    slateRootNode,
    forceUpdate,
    insertText,
    deleteContentBackward,
  }: SlateEditor) {
    this.domEl = domEl
    this.slateRange = slateRange
    this.slateRootNode = slateRootNode
    this.forceUpdate = forceUpdate
    this.insertText = insertText
    this.deleteContentBackward = deleteContentBackward
  }
}

export default SlateEditor
