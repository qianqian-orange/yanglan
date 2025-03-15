import { diff } from './diff'

export function render(vnode, parentDOM) {
  const oldVNode = parentDOM._children
  parentDOM._children = vnode
  const oldDOM = oldVNode ? oldVNode._dom : parentDOM.firstChild
  diff(parentDOM, vnode, oldVNode || {}, oldDOM)
}
