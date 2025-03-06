function updateAttributes(oldVnode, newVnode) {
  let oldAttrs = oldVnode.data?.attrs
  let newAttrs = newVnode.data?.attrs
  const elm = newVnode.elm
  if (!oldAttrs && !newAttrs) return
  if (oldAttrs === newAttrs) return
  oldAttrs = oldAttrs || {}
  newAttrs = newAttrs || {}
  for (const key in oldAttrs) {
    if (!Object.prototype.hasOwnProperty.call(newAttrs, key)) {
      elm.removeAttribute(key)
    }
  }
  for (const key in newAttrs) {
    const value = newAttrs[key]
    if (value !== oldAttrs[key]) {
      if (value === true) {
        elm.setAttribute(key, '')
      } else if (value === false) {
        elm.removeAttribute(key)
      } else {
        elm.setAttribute(key, value)
      }
    }
  }
}

export const attributesModule = {
  create: updateAttributes,
  update: updateAttributes,
}
