export const NOT_LOADED = 'NOT_LOADED'
export const LOADING_SOURCE_CODE = 'LOADING_SOURCE_CODE'
export const NOT_BOOTSTRAPPED = 'NOT_BOOTSTRAPPED'
export const BOOTSTRAPPING = 'BOOTSTRAPPING'
export const NOT_MOUNTED = 'NOT_MOUNTED'
export const MOUNTING = 'MOUNTING'
export const MOUNTED = 'MOUNTED'
export const UNMOUNTING = 'UNMOUNTING'

const apps = []

export function shouldBeActive(app) {
  return app.activeWhen(window.location)
}

export function registerApplication(appName, loadApp, activeWhen, customProps) {
  apps.push({
    appName,
    loadApp,
    activeWhen,
    customProps,
    status: NOT_LOADED,
  })
}

export function getAppChanges() {
  const appsToUnmount = []
  const appsToLoad = []
  const appsToMount = []
  apps.forEach(app => {
    const appShouldBeActive = shouldBeActive(app)
    switch (app.status) {
      case NOT_LOADED:
      case LOADING_SOURCE_CODE:
        if (appShouldBeActive) appsToLoad.push(app)
        break
      case NOT_BOOTSTRAPPED:
      case NOT_MOUNTED:
        if (appShouldBeActive) appsToMount.push(app)
        break
      case MOUNTED:
        if (!appShouldBeActive) appsToUnmount.push(app)
        break
    }
  })

  return {
    appsToLoad,
    appsToMount,
    appsToUnmount,
  }
}
