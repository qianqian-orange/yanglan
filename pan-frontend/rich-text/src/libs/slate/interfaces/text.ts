import { isPlainObject } from 'is-plain-object'
import { Descendant } from './node'

export interface BaseText {
  text: string
  [key: string]: unknown
}

export const Text = {
  isText(node: Descendant) {
    return isPlainObject(node) && typeof node.text === 'string'
  },
}
