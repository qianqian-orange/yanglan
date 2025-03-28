import { patchHistoryApi } from './navigation/navigation-events'
import { reroute } from './navigation/reroute'

export * from './applications/apps'
export * from './lifecycles'

export function start() {
  patchHistoryApi()
  reroute()
}
