import { Descendant } from './node'

export interface BaseElement {
  children: Descendant[]
  [key: string]: unknown
}
