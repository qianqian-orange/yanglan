import ReactSharedInternals from '../shared/ReactSharedInternals'
import { REACT_ELEMENT_TYPE } from '../shared/ReactSymbol'
import { HooksDispatcher } from './ReactFizzHooks'

const uppercasePattern = /([A-Z])/g

function pushStyleAttribute(target, style) {
  const ans = []
  for (const styleName in style) {
    const styleValue = style[styleName]
    ans.push(
      `${styleName
        .replace(uppercasePattern, '-$1')
        .toLowerCase()}:${styleValue}`,
    )
  }
  target.push(` style="${ans.join(';')}"`)
}

function pushAttribute(target, name, value) {
  switch (name) {
    case 'className':
      target.push(` class="${value}"`)
      break
    case 'style':
      pushStyleAttribute(target, value)
      break
  }
}

function pushStartGenericElement(target, props, tag) {
  target.push(`<${tag}`)
  let children = null
  for (const propKey in props) {
    switch (propKey) {
      case 'children':
        children = props[propKey]
        break
      default:
        pushAttribute(target, propKey, props[propKey])
    }
  }
  target.push('>')
  if (typeof children === 'string') {
    target.push(children)
    return null
  }
  return children
}

function renderElement(task, type, props) {
  if (typeof type === 'function') {
    const children = type(props)
    task.node = children
    retryNode(task)
  } else if (typeof type === 'string') {
    const { chunks } = task.blockedSegment
    const children = pushStartGenericElement(chunks, props, type)
    task.node = children
    retryNode(task)
    chunks.push(`</${type}>`)
  }
}

function renderChildrenArray(task, children) {
  for (let i = 0; i < children.length; i++) {
    task.node = children[i]
    retryNode(task)
  }
}

function retryNode(task) {
  const {
    node,
    blockedSegment: { chunks },
  } = task
  if (node === null) return
  if (Array.isArray(node)) {
    renderChildrenArray(task, node)
    return
  }
  if (typeof node === 'object') {
    switch (node.$$typeof) {
      case REACT_ELEMENT_TYPE:
        renderElement(task, node.type, node.props)
        break
    }
    return
  }
  chunks.push(`${node}`)
}

export function startWork(task) {
  const prevDispatcher = ReactSharedInternals.H
  // 赋值服务端渲染时调用的Hook方法
  ReactSharedInternals.H = HooksDispatcher
  retryNode(task)
  ReactSharedInternals.H = prevDispatcher
}

export function startFlowing(task, destination) {
  const {
    blockedSegment: { chunks },
  } = task
  for (let i = 0; i < chunks.length; i++) {
    destination.push(chunks[i])
  }
}
