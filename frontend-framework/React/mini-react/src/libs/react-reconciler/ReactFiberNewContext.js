import { createCursor, pop, push } from './ReactFiberStack'

const valueCursor = createCursor()

export function pushProvider(context, value) {
  push(valueCursor, context._currentValue)
  context._currentValue = value
}

export function popProvider(context) {
  context._currentValue = valueCursor.current
  pop(valueCursor)
}

export function readContext(context) {
  const value = context._currentValue
  return value
}
