import { INSERT_VNODE, MATCHED } from '../constant'
import { createVNode } from '../create-element'
import { setCurrentIndex } from '../hooks/useState'
import { insert } from './children'
import { setProperty } from './props'

export let currentVNode = null

function diffChildren(
  parentDOM,
  newChildren,
  newParentVNode,
  oldParentVNode,
  oldDom,
) {
  let firstChildDom
  let newDom
  let oldVNode
  const oldChildren = oldParentVNode._children || []
  newParentVNode._children = new Array(newChildren.length)
  for (let i = 0; i < newChildren.length; i++) {
    let childVNode = newChildren[i]
    if (typeof childVNode === 'string' || typeof childVNode === 'number') {
      childVNode = newParentVNode._children[i] = createVNode(
        null,
        childVNode,
        null,
      )
    } else {
      newParentVNode._children[i] = childVNode
    }
    childVNode._parent = newParentVNode
    if (typeof childVNode.type !== 'function') {
      childVNode._flags |= INSERT_VNODE
    }
    if (childVNode._index === -1) {
      oldVNode = {}
    } else {
      oldVNode = oldChildren[childVNode._index] || {}
    }
    childVNode._index = i
    const result = diff(parentDOM, childVNode, oldVNode)
    newDom = childVNode._dom
    if (!firstChildDom && newDom) {
      firstChildDom = newDom
    }
    if (childVNode._flags & INSERT_VNODE) {
      oldDom = insert(childVNode, oldDom, parentDOM)
    } else if (typeof childVNode.type === 'function' && result !== undefined) {
      oldDom = result
    } else if (newDom) {
      oldDom = newDom.nextSibling
    }
    childVNode._flags &= ~(INSERT_VNODE | MATCHED)
  }
  newParentVNode._dom = firstChildDom
  return oldDom
}

function diffElementNodes(dom, newVNode, oldVNode) {
  const oldProps = oldVNode.props || {}
  const newProps = newVNode.props
  let newChildren
  if (dom == null) {
    if (newVNode.type == null) return document.createTextNode(newProps)
    dom = document.createElement(newVNode.type)
  }
  for (const key in oldProps) {
    const value = oldProps[key]
    if (key === 'children') continue
    if (!(key in newProps)) {
      setProperty(dom, key, null, value)
    }
  }
  for (const key in newProps) {
    const value = newProps[key]
    if (key === 'children') {
      newChildren = value
    } else if (value !== oldProps[key]) {
      setProperty(dom, key, value, oldProps[key])
    }
  }
  diffChildren(
    dom,
    Array.isArray(newChildren) ? newChildren : [newChildren],
    newVNode,
    oldVNode,
  )
  return dom
}

export function diff(parentDOM, newVNode, oldVNode, oldDom) {
  const Component = newVNode.type
  if (typeof Component === 'function') {
    currentVNode = newVNode
    newVNode._parentDom = parentDOM
    const children = Component(newVNode.props)
    currentVNode = null
    setCurrentIndex(0)
    diffChildren(
      parentDOM,
      Array.isArray(children) ? children : [children],
      newVNode,
      oldVNode,
    )
  } else {
    oldDom = newVNode._dom = diffElementNodes(oldVNode._dom, newVNode, oldVNode)
  }
  return newVNode._flags ? oldDom : undefined
}
