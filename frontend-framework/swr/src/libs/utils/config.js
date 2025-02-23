import { initCache } from './cache'

// cache是Map类型数据，key是请求对应的字符串标识，value是请求返回的结果
const [cache] = initCache(new Map())

export const defaultConfig = {
  cache,
  dedupingInterval: 2000, // 2s内相同请求会合并处理
}
