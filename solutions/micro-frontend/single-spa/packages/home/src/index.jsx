import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

let root = null

const lifecycles = {
  bootstrap(opts) {
    console.log('home bootstrap', opts)
    return Promise.resolve()
  },
  mount(opts) {
    return new Promise(resolve => {
      console.log('home mount', opts)
      root = createRoot(document.querySelector('#subapp'))
      root.render(<App />)
      resolve()
    })
  },
  unmount(opts) {
    return new Promise(resolve => {
      console.log('home unmount', opts)
      if (root) {
        root.unmount()
        root = null
      }
      resolve()
    })
  },
}

export const { bootstrap, mount, unmount } = lifecycles
