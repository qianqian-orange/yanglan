import { DefaultLane } from './FiberNode'
import FiberRootNode from './FiberRootNode'
import { performWorkOnRoot } from './ReactFiberReconciler'

/**
 * @param {*} root FiberRootNode对象
 */
function ReactDOMRoot(root) {
  this._internalRoot = root
}

/**
 * @param {*} children ReactElement对象
 */
ReactDOMRoot.prototype.render = function (children) {
  const root = this._internalRoot
  root.pendingLanes = DefaultLane
  const { current } = root
  current.lanes = DefaultLane
  current.pendingProps = { children }
  performWorkOnRoot(root, root.pendingLanes)
}

/**
 * @param {*} element DOM节点
 */
function createRoot(element) {
  element.addEventListener('click', (event) => {
    if (event.target.onClick) {
      event.target.onClick()
    }
  })
  const root = new FiberRootNode(element)
  return new ReactDOMRoot(root)
}

export { createRoot }
