import { getFiberCurrentPropsFromNode } from '../../../libs/react-dom-bindings/ReactDOMComponentTree'
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
  container.addEventListener('click', event => {
    const props = getFiberCurrentPropsFromNode(event.target)
    props?.onClick()
  })
  const root = new FiberRootNode(container)
  return new ReactDOMRoot(root)
}

function hydrateRoot(container, initialChildren) {
  container.addEventListener('click', event => {
    const props = getFiberCurrentPropsFromNode(event.target)
    props?.onClick()
  })
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
