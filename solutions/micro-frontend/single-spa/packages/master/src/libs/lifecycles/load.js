import {
  LOADING_SOURCE_CODE,
  NOT_BOOTSTRAPPED,
  NOT_LOADED,
} from '../single-spa'

export function toLoadPromise(app) {
  return Promise.resolve().then(() => {
    if (app.loadPromise) return app.loadPromise
    if (app.status !== NOT_LOADED) return app
    app.status = LOADING_SOURCE_CODE
    return (app.loadPromise = Promise.resolve().then(() => {
      const loadPromise = app.loadApp(app.customProps)
      return loadPromise.then(lifecycle => {
        app.status = NOT_BOOTSTRAPPED
        app.bootstrap = lifecycle.bootstrap
        app.mount = lifecycle.mount
        app.unmount = lifecycle.unmount
        delete app.loadPromise
        return app
      })
    }))
  })
}
