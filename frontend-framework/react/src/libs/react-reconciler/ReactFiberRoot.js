import FiberNode from './ReactFiber'
import { createLaneMap, NoLanes, NoTimestamp } from './ReactFiberLane'
import { HostRoot } from './ReactWorkTags'

/**
 * @param {*} element DOM节点
 */
function FiberRootNode(element) {
  // 记录根DOM节点
  this.containerInfo = element
  // 创建根FiberNode节点
  const fiber = new FiberNode(HostRoot, null)
  fiber.stateNode = this
  // 记录根FiberNode节点
  this.current = fiber
  // 优先级
  this.pendingLanes = NoLanes

  // 任务过期优先级
  this.expiredLanes = NoLanes
  this.expirationTimes = createLaneMap(NoTimestamp)

  // 关联优先级
  this.entangledLanes = NoLanes
  this.entanglements = createLaneMap(NoLanes)

  // 记录优先级任务
  this.callbackNode = null
  // 记录任务优先级
  this.callbackPriority = NoLanes
}

export default FiberRootNode
