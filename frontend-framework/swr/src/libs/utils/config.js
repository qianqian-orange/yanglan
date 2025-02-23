import { initCache } from './cache'

const [cache] = initCache(new Map())

export const defaultConfig = {
  cache,
}
