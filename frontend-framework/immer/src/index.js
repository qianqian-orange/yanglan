import { produce } from './libs'

const state = {
  name: 'zhansgan',
  age: 10,
  list: [0, 1, 2],
}

const nextState = produce(state, draft => {
  draft.name = 'lisi'
  draft.list[1] = 3
})

console.log(state, nextState)
