import SlateNode from './SlateNode'

class SlatePoint {
  path: number[] // 节点路径
  offset: number // 偏移距离

  constructor({ path, offset }: SlatePoint) {
    this.path = path
    this.offset = offset
  }

  static toSlatePoint(el: Node, offset: number): SlatePoint {
    const slateNode = SlateNode.toSlateNodeByEl(el)
    if (slateNode.text.startsWith('\uFEFF')) offset = 1
    return new SlatePoint({ path: slateNode.path, offset })
  }

  static toDOMPoint(slateNode: SlateNode, point: SlatePoint): [Node, number] {
    const { path, offset } = point
    slateNode = SlateNode.toSlateNodeByPath(slateNode, path)
    const el =
      slateNode.stateNode!.querySelector('[data-slate-leaf]')!.childNodes[0]
    return [el, offset]
  }
}

export default SlatePoint
