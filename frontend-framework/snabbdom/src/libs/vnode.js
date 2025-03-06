export function vnode(sel, data, children, text, elm) {
  const key = data === undefined ? undefined : data.key
  return { sel, key, data, children, text, elm }
}
