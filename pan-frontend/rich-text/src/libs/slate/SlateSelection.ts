import SlateNode from './SlateNode'
import SlatePoint from './SlatePoint'

class SlateSelection {
  anchor: SlatePoint // 选择区域开始锚点
  focus: SlatePoint // 选择区域结束锚点

  constructor({ anchor, focus }: SlateSelection) {
    this.anchor = anchor
    this.focus = focus
  }

  static toSlateSelection(selection: Selection): SlateSelection | null {
    const { anchorNode, anchorOffset, focusNode, focusOffset } = selection
    if (
      anchorNode == null ||
      anchorOffset == null ||
      focusNode == null ||
      focusOffset == null
    )
      return null
    const anchor = SlatePoint.toSlatePoint(anchorNode, anchorOffset)
    const focus = SlatePoint.toSlatePoint(focusNode, focusOffset)
    return new SlateSelection({ anchor, focus })
  }

  static toDOMRange(
    slateNode: SlateNode,
    slateSelection: SlateSelection,
  ): StaticRange {
    const { anchor, focus } = slateSelection
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

export default SlateSelection
