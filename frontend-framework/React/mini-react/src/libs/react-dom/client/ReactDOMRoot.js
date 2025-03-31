import { DefaultLane } from '../../react-reconciler/ReactFiberLane'
import FiberRootNode from '../../react-reconciler/ReactFiberRoot'
import { scheduleUpdateOnFiber } from '../../react-reconciler/ReactFiberWorkLoop'

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
  const { current } = root
  current.lanes = DefaultLane
  current.pendingProps = { children }
  scheduleUpdateOnFiber(root, DefaultLane)
}

/**
 * @param {*} element DOM节点
 */
function createRoot(element) {
  element.addEventListener('click', event => {
    if (event.target.onClick) event.target.onClick()
  })
  const root = new FiberRootNode(element)
  return new ReactDOMRoot(root)
}

export { createRoot }
