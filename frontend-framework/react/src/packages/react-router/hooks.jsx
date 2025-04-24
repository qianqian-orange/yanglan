import React, { useContext } from '../../libs'
import { LocationContext, RouteContext } from './context'
import { matchRoutes } from './router/utils'

export function useLocation() {
  return useContext(LocationContext).location
}

export function useRoutes(routes) {
  const location = useLocation()
  const matches = matchRoutes(routes, location)
  return matches.map((match, index) => (
    <RouteContext.Provider key={index} value={{ match }}>
      {match.route.element}
    </RouteContext.Provider>
  ))
}
