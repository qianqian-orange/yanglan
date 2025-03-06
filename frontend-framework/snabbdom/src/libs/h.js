import { vnode } from './vnode'

export function h(sel, data, children) {
  let text
  if (typeof children === 'string') {
    text = children
  } else if (!Array.isArray(children)) {
    children = [children]
  }
  if (Array.isArray(children)) {
    for (let i = 0; i < children.length; i++) {
      if (typeof children[i] === 'string')
        children[i] = vnode(
          undefined,
          undefined,
          undefined,
          children[i],
          undefined,
        )
    }
  }
  return vnode(
    sel,
    data,
    Array.isArray(children) ? children : undefined,
    text,
    undefined,
  )
}
