import { registerApplication, start } from 'single-spa'

registerApplication(
  '@qianqian/home',
  () => System.import('@qianqian/home'),
  location => location.pathname.startsWith('/home'),
)

registerApplication(
  '@qianqian/account',
  () => System.import('@qianqian/account'),
  location => location.pathname.startsWith('/account'),
)

start()
