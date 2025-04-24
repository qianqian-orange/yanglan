import { listenToAllSupportedEvents } from '../../react-dom-bindings/events/DOMPluginEventSystem'
import {
  DefaultHydrationLane,
  DefaultLane,
} from '../../react-reconciler/ReactFiberLane'
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
function createRoot(container) {
  // 初始化React事件机制
  listenToAllSupportedEvents(container)
  const root = new FiberRootNode(container)
  return new ReactDOMRoot(root)
}

function hydrateRoot(container, initialChildren) {
  // 初始化React事件机制
  listenToAllSupportedEvents(container)
  const root = new FiberRootNode(container)
  const { current } = root
  current.memoizedState = {
    element: initialChildren,
    isDehydrated: true,
  }
  current.lanes = DefaultHydrationLane
  scheduleUpdateOnFiber(root, DefaultHydrationLane)
  return new ReactDOMRoot(root)
}

export { createRoot, hydrateRoot }
