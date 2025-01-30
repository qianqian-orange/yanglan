import SlateNode from './SlateNode'
import SlatePoint from './SlatePoint'

class SlateRange {
  anchor: SlatePoint // 选择区域开始锚点
  focus: SlatePoint // 选择区域结束锚点

  constructor({ anchor, focus }: SlateRange) {
    this.anchor = anchor
    this.focus = focus
  }

  static toSlateRange(range: StaticRange): SlateRange {
    const { startContainer, startOffset, endContainer, endOffset } = range
    const anchor = SlatePoint.toSlatePoint(startContainer, startOffset)
    const focus = SlatePoint.toSlatePoint(endContainer, endOffset)
    return new SlateRange({ anchor, focus })
  }

  static toDOMRange(slateNode: SlateNode, slateRange: SlateRange): StaticRange {
    const { anchor, focus } = slateRange
    const [startContainer, startOffset] = SlatePoint.toDOMPoint(
      slateNode,
      anchor,
    )
    const [endContainer, endOffset] = SlatePoint.toDOMPoint(slateNode, focus)
    const range = new StaticRange({
      startContainer,
      startOffset,
      endContainer,
      endOffset,
    })
    return range
  }
}

export default SlateRange
