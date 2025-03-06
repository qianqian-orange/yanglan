function updateClass(oldVnode, newVnode) {
  let oldClass = oldVnode.data?.class
  let newClass = newVnode.data?.class
  const elm = newVnode.elm
  if (!oldClass && !newClass) return
  if (oldClass === newClass) return
  oldClass = oldClass || {}
  newClass = newClass || {}
  for (const key in oldClass) {
    if (oldClass[key] && !Object.prototype.hasOwnProperty.call(newClass, key)) {
      elm.classList.remove(key)
    }
  }
  for (const key in newClass) {
    const value = newClass[key]
    if (value !== oldClass[key]) {
      elm.classLcist[value ? 'add' : 'remove'](key)
    }
  }
}

export const classModule = { create: updateClass, update: updateClass }
