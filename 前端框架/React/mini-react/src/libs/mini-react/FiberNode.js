// 根FiberNode节点对应类型
export const HostRoot = 3
// 组件方法FiberNode节点对应类型
export const FunctionComponent = 0
// 元素标签FiberNode节点对应类型
export const HostComponent = 5
// 纯文本FiberNode节点对应类型
export const HostText = 6

// 表示该FiberNode节点无需处理
export const NoFlags = 0
// 表示该FiberNode节点是新增节点，需要插入DOM树中
export const Placement = 2
// 表示该FiberNode节点需要更新处理
export const Update = 4
// 表示该FiberNode节点有子节点要删除
export const ChildDeletion = 16

export const NoLanes = 0

export const DefaultLane = 32

export const SyncLane = 2

function FiberNode(tag, pendingProps) {
  this.tag = tag // FiberNode节点类型
  this.key = null // 对应ReactElement的key属性
  this.elementType = null // 对应ReactElement的type属性
  this.return = null // 父FiberNode节点
  this.child = null // 子FiberNode节点
  this.sibling = null // 兄弟FiberNode节点
  this.alternate = null // FiberNode副本节点
  this.deletions = null // 删除的FiberNode节点
  this.flags = NoFlags // FiberNode节点状态
  this.subtreeFlags = NoFlags // 子树FiberNode节点状态
  this.stateNode = null // FiberNode节点对应的DOM节点
  this.pendingProps = pendingProps // 对应ReactElement的props属性
  this.memoizedState = null // 记录useState数据
  this.lanes = NoLanes // 优先级标记
}

export default FiberNode
