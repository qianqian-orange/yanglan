import {
  init,
  classModule,
  styleModule,
  attributesModule,
  eventListenersModule,
  h,
} from './libs'

const patch = init([
  classModule,
  styleModule,
  attributesModule,
  eventListenersModule,
])

const vnode = h(
  'div',
  {
    attrs: { id: 'app' },
    on: {
      click: () => {
        patch(
          vnode,
          h('div', { attrs: { id: 'app' } }, [h('h1', {}, 'are you ok')]),
        )
      },
    },
  },
  [h('h1', {}, 'hello world')],
)
patch(document.querySelector('#app'), vnode)
