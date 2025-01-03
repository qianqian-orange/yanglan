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
  performWorkOnRoot(root, children)
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
