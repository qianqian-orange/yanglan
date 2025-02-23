import { stableHash } from './hash'

// key是任意数据类型，要转换成字符串
export const serialize = key => {
  try {
    if (typeof key === 'function') key = key()
  } catch {
    key = ''
  }
  const args = key
  key =
    typeof key === 'string'
      ? key
      : (Array.isArray(key) ? key.length : key)
        ? stableHash(key)
        : ''
  return [key, args]
}
