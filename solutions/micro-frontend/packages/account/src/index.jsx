import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

const lifecycles = {
  bootstrap(opts) {
    console.log('bootstrap', opts)
    return Promise.resolve()
  },
  mount(opts) {
    return new Promise(resolve => {
      console.log('mount', opts)
      const root = createRoot(document.querySelector('#subapp'))
      root.render(<App />)
      // opts.renderResults[opts.name] = root
      resolve()
    })
  },
  unmount(opts) {
    return new Promise(resolve => {
      console.log('unmount', opts)
      resolve()
      // opts.unmountResolves[opts.name] = resolve
      // const root = opts.renderResults[opts.name]
      // root.unmount()
    })
  },
}

export const { bootstrap, mount, unmount } = lifecycles
