import FiberNode, { HostRoot } from './FiberNode'

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
}

export default FiberRootNode
