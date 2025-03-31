import { readContext } from '../ReactFiberNewContext'

export function useContext(context) {
  return readContext(context)
}
