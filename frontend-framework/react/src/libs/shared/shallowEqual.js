// 通过Object.is方法比较属性值是否相同
export function shallowEqual(objA, objB) {
  if (Object.is(objA, objB)) return true
  if (
    typeof objA !== 'object' ||
    objA === null ||
    typeof objB !== 'object' ||
    objB === null
  )
    return false
  const keysA = Object.keys(objA)
  const keysB = Object.keys(objB)
  if (keysA.length !== keysB.length) return false
  for (let i = 0; i < keysA.length; i++) {
    const currentKey = keysA[i]
    if (
      !Object.prototype.hasOwnProperty.call(objB, currentKey) ||
      !Object.is(objA[currentKey], objB[currentKey])
    )
      return false
  }
  return true
}
