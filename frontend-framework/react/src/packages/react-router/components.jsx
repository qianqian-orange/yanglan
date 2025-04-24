import React from '../../libs'
import { LocationContext, NavigationContext } from './context'
import { useRoutes } from './hooks'

/**
 * @param {*} location 自定义location实例
 * @param {*} navigator 自定义history实例
 * @param {*} navigationType history路由变更类型
 * @param {*} children child ReactElement
 */
export function Router({ location, navigator, navigationType, children }) {
  return (
    <NavigationContext.Provider value={{ navigator }}>
      <LocationContext.Provider value={{ location, navigationType }}>
        {children}
      </LocationContext.Provider>
    </NavigationContext.Provider>
  )
}

function createRoutesFromChildren(children) {
  return children.map(element => ({
    path: element.props.path,
    element: element.props.element,
  }))
}

export function Routes({ children }) {
  return useRoutes(createRoutesFromChildren(children))
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Route({ path, element }) {
  return <></>
}
