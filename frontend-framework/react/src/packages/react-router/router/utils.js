// 获取当前页面路径匹配的路由
export function matchRoutes(routes, location) {
  const { pathname } = location
  return routes
    .filter(route => route.path === pathname)
    .map(route => ({ pathname, route }))
}
