// 记录指示器索引
let index = -1
// 记录指示器value
const valueStack = []

export function createCursor(defaultValue) {
  return { current: defaultValue }
}

// 将上一个Context初始值保存到valueStack队列中，然后将新值赋值给cursor.current
export function push(cursor, value) {
  valueStack[++index] = cursor.current
  cursor.current = value
}

// 获取上一个Context初始值，然后将valueStack对应元素赋值为null
export function pop(cursor) {
  cursor.current = valueStack[index]
  valueStack[index--] = null
}
