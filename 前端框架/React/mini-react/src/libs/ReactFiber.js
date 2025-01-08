import { NoFlags } from './ReactFiberFlags'
import { NoLanes } from './ReactFiberLane'

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
