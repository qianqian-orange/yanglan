import { MOUNTED, MOUNTING, NOT_MOUNTED } from '../single-spa'

export function toMountPromise(app) {
  return Promise.resolve().then(() => {
    if (app.status !== NOT_MOUNTED) return app
    app.status = MOUNTING
    return app.mount(app.customProps).then(() => {
      app.status = MOUNTED
      return app
    })
  })
}
