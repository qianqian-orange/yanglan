import { BOOTSTRAPPING, NOT_BOOTSTRAPPED, NOT_MOUNTED } from '../single-spa'

export function toBootstrapPromise(app) {
  return Promise.resolve().then(() => {
    if (app.status !== NOT_BOOTSTRAPPED) return app
    app.status = BOOTSTRAPPING
    return app.bootstrap(app.customProps).then(() => {
      app.status = NOT_MOUNTED
      return app
    })
  })
}
