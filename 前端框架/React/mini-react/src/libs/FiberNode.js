import { NoFlags } from './ReactFiberFlags'

// 根FiberNode节点对应类型
export const HostRoot = 3
// 组件方法FiberNode节点对应类型
export const FunctionComponent = 0
// 元素标签FiberNode节点对应类型
export const HostComponent = 5
// 纯文本FiberNode节点对应类型
export const HostText = 6

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
  this.memoizedState = null // 记录Hook链表数据
  this.lanes = NoLanes // 优先级标记
  this.updateQueue = null // 记录useEffect数据
  this.ref = null // 记录useRef数据
}

export default FiberNode
