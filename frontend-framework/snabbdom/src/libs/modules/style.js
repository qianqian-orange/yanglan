function updateStyle(oldVnode, newVnode) {
  const elm = newVnode.elm
  let oldStyle = oldVnode.data?.style
  let newStyle = newVnode.data?.style
  if (!oldStyle && !newStyle) return
  if (oldStyle === newStyle) return
  oldStyle = oldStyle || {}
  newStyle = newStyle || {}
  for (const key in oldStyle) {
    elm.style[key] = ''
  }
  for (const key in newStyle) {
    const value = newStyle[key]
    if (value !== oldStyle[key]) {
      elm.style[key] = value
    }
  }
}

export const styleModule = { create: updateStyle, update: updateStyle }
