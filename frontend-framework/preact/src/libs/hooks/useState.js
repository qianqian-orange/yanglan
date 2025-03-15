import { currentVNode, diff } from '../diff'

let currentIndex = 0

export function setCurrentIndex(index) {
  currentIndex = index
}

export function useState(initialState) {
  const hookState = currentVNode._hooks[currentIndex] || {}
  if (!hookState._vnode) {
    currentVNode._hooks.push(hookState)
    hookState._vnode = currentVNode
    hookState._value = [
      initialState,
      action => {
        const currentValue = hookState._value[0]
        const nextValue =
          typeof action === 'function' ? action(currentValue) : action
        if (currentValue !== nextValue) {
          hookState._value = [nextValue, hookState._value[1]]
          const oldVNode = hookState._vnode
          const newVNode = { ...oldVNode }
          if (oldVNode._parentDom) {
            diff(oldVNode._parentDom, newVNode, oldVNode)
            newVNode._parent._children[newVNode._index] = newVNode
          }
        }
      },
    ]
  }
  return hookState._value
}
