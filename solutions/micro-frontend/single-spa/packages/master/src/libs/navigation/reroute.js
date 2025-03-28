import {
  getAppChanges,
  shouldBeActive,
  toBootstrapPromise,
  toLoadPromise,
  toMountPromise,
  toUnmountPromise,
} from '../single-spa'

function tryToBootstrapAndMount(app, unmountAllPromise) {
  if (shouldBeActive(app)) {
    return toBootstrapPromise(app).then(app =>
      unmountAllPromise.then(() =>
        shouldBeActive(app) ? toMountPromise(app) : app,
      ),
    )
  }
  return unmountAllPromise.then(() => app)
}

export function reroute() {
  const { appsToLoad, appsToMount, appsToUnmount } = getAppChanges()
  performAppChanges()

  function performAppChanges() {
    return Promise.resolve().then(() => {
      const unmountPromises = appsToUnmount.map(toUnmountPromise)
      const unmountAllPromise = Promise.all(unmountPromises)
      const loadThenMountPromises = appsToLoad.map(app =>
        toLoadPromise(app).then(app =>
          tryToBootstrapAndMount(app, unmountAllPromise),
        ),
      )
      const mountPromises = appsToMount.map(app =>
        tryToBootstrapAndMount(app, unmountAllPromise),
      )
      return unmountAllPromise.then(() =>
        Promise.all(loadThenMountPromises.concat(mountPromises)),
      )
    })
  }
}
