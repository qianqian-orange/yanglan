import { createContext } from '../../libs'

export const NavigationContext = createContext(null)
export const LocationContext = createContext(null)
export const RouteContext = createContext({ matches: [] })
