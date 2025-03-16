import { filter, map, Observable } from './libs'

const observable = new Observable(subscriber => {
  console.log('hello world')
  subscriber.next(1)
}).pipe(
  map(x => x * 2),
  filter(x => x),
)

observable.subscribe(x => {
  console.log(x)
})
