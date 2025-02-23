// 维护object与key的映射关系
const table = new WeakMap()

const isObjectType = (value, type) =>
  Object.prototype.toString.call(value) === `[object ${type}]`

let counter = 0

export const stableHash = arg => {
  const isDate = isObjectType(arg, 'Date')
  const isRegex = isObjectType(arg, 'RegExp')
  const isPlainObject = isObjectType(arg, 'Object')
  let result
  if (Object(arg) === arg && !isDate && !isRegex) {
    // Object/function, not null/date/regexp. Use WeakMap to store the id first.
    // If it's already hashed, directly return the result.
    result = table.get(arg)
    if (result) return result
    result = ++counter + '~'
    table.set(arg, result)
    if (Array.isArray(arg)) {
      result = '@'
      for (let index = 0; index < arg.length; index++) {
        result += stableHash(arg[index]) + ','
      }
      table.set(arg, result)
    } else if (isPlainObject) {
      result = '#'
      const keys = Object.keys(arg).sort()
      while (keys.length) {
        let index = keys.pop()
        result += index + ':' + stableHash(arg[index]) + ','
      }
      table.set(arg, result)
    }
  } else {
    result = isDate
      ? arg.toJSON()
      : typeof arg === 'symbol'
        ? arg.toString()
        : typeof arg === 'string'
          ? JSON.stringify(arg)
          : '' + arg
  }
  return result
}
