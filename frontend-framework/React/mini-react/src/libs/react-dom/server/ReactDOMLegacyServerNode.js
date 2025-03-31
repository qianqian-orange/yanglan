import { REACT_ELEMENT_TYPE } from '../../shared/ReactSymbol'

function startFlowing(task, destination) {
  const {
    blockedSegment: { chunks },
  } = task
  for (let i = 0; i < chunks.length; i++) {
    destination.push(chunks[i])
  }
}

function pushAttribute(target, name, value) {
  switch (name) {
    case 'className':
      target.push(`class="${value}"`)
      break
  }
}

function pushStartGenericElement(target, props, tag) {
  target.push(`<${tag}`)
  tag = null
  for (const propKey in props) {
    switch (propKey) {
      case 'children':
        tag = props[propKey]
        break
      default:
        pushAttribute(target, propKey, props[propKey])
    }
  }
  target.push('>')
  if (typeof tag === 'string') {
    target.push(tag)
    return null
  }
  return tag
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
  if (typeof node === 'object' && node !== null) {
    switch (node.$$typeof) {
      case REACT_ELEMENT_TYPE:
        renderElement(task, node.type, node.props)
        break
    }
    return
  }
  if (Array.isArray(node)) {
    renderChildrenArray(task, node)
    return
  }
  if (typeof node === 'string') {
    chunks.push(node)
    return
  }
  if (typeof node === 'number') {
    chunks.push(`${node}`)
    return
  }
}

function renderToString(children) {
  const task = {
    node: children,
    blockedSegment: {
      chunks: [],
    },
  }
  retryNode(task)
  let result = ''
  startFlowing(task, {
    push(chunk) {
      if (chunk) result += chunk
    },
  })
  return result
}

export { renderToString }
