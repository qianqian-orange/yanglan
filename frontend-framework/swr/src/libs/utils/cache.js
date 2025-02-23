import { SWRGlobalState } from './global-state'

export const initCache = provider => {
  if (!SWRGlobalState.has(provider)) {
    // key为调用useSWR方法传入的第一个入参对应的字符串标识, value是收集更新渲染方法
    const subscriptions = {}

    const setter = (key, value, prev) => {
      provider.set(key, value)

      const subs = subscriptions[key]
      if (subs) {
        subs.forEach(fn => fn(value, prev))
      }
    }

    const subscribe = (key, callback) => {
      if (!subscriptions[key]) subscriptions[key] = []
      const subs = subscriptions[key]
      subs.push(callback)

      return () => subs.splice(subs.indexOf(callback), 1)
    }

    SWRGlobalState.set(provider, [{}, {}, {}, {}, setter, subscribe])
  }

  return [provider]
}
