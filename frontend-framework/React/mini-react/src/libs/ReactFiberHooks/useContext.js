import { readContext } from '../react-reconciler/ReactFiberNewContext'

export function useContext(context) {
  return readContext(context)
}
