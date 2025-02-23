import { SWRGlobalState } from './global-state'

export const initCache = provider => {
  if (!SWRGlobalState.has(provider)) {
    SWRGlobalState.set(provider, [{}, {}, {}, {}])
  }

  return [provider]
}
