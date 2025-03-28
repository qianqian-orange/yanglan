import { reroute } from './reroute'

function patchedUpdateState(updateState) {
  return function () {
    const urlBefore = window.location.href
    const result = updateState.apply(this, arguments)
    const urlAfter = window.location.href
    if (urlBefore !== urlAfter) {
      window.dispatchEvent(
        new PopStateEvent('popstate', { state: window.history.state }),
      )
    }
    return result
  }
}

export function patchHistoryApi() {
  window.addEventListener('popstate', () => {
    reroute()
  })
  window.history.pushState = patchedUpdateState(window.history.pushState)
}
