import { Descendant } from '@/libs/slate/interfaces/node'
import { Key } from '../utils/key'
import { NODE_TO_KEY } from '../utils/weak-maps'

export const DOMEditor = {
  findKey(node: Descendant) {
    let key = NODE_TO_KEY.get(node)
    if (!key) {
      key = new Key()
      NODE_TO_KEY.set(node, key)
    }
    return key
  },
}
