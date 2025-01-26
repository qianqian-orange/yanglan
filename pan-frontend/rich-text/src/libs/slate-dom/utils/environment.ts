export const IS_IOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

export const IS_APPLE = /Mac OS X/.test(navigator.userAgent)

export const IS_ANDROID = /Android/.test(navigator.userAgent)

export const IS_FIREFOX = /^(?!.*Seamonkey)(?=.*Firefox).*/i.test(
  navigator.userAgent,
)

export const IS_WEBKIT = /AppleWebKit(?!.*Chrome)/i.test(navigator.userAgent)

export const IS_CHROME = /Chrome/i.test(navigator.userAgent)

export const IS_UC_MOBILE = /.*UCBrowser/.test(navigator.userAgent)
