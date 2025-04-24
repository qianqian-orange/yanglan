const Action = {
  Pop: 'Pop',
  Push: 'Push',
  Replace: 'Replace',
}

export function createBrowserHistory() {
  let action = Action.Pop
  let listener = null

  const handlePop = () => {}

  const history = {
    get action() {
      return action
    },
    get location() {
      const { pathname, search, hash } = window.location
      return {
        pathname,
        search,
        hash,
      }
    },
    push: to => {
      action = Action.Push
      window.history.pushState(null, '', to)
      listener()
    },
    subscribe: callback => {
      listener = callback
      window.addEventListener('popstate', handlePop)
      return () => {
        window.removeEventListener('popstate', handlePop)
        listener = null
      }
    },
    getSnapshot: () => {
      return {
        action: history.action,
        location: history.location,
      }
    },
  }

  return history
}
