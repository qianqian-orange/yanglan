import React, { useContext, useRef, useSyncExternalStore } from '../../../libs'
import { Router } from '../components'
import { NavigationContext } from '../context'
import { createBrowserHistory } from '../router/history'

export function BrowserRouter({ children }) {
  const historyRef = useRef()

  if (historyRef.current === null) historyRef.current = createBrowserHistory()

  const history = historyRef.current

  const { action, location } = useSyncExternalStore(
    history.subscribe,
    history.getSnapshot,
  )

  return (
    <Router location={location} navigator={history} navigationType={action}>
      {children}
    </Router>
  )
}

export function Link({ to, children }) {
  const { navigator } = useContext(NavigationContext)

  return (
    <a
      onClick={() => {
        navigator.push(to)
      }}
    >
      {children}
    </a>
  )
}
