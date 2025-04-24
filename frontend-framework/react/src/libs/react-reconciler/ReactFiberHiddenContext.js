import { NoLanes } from './ReactFiberLane'
import { createCursor, pop, push } from './ReactFiberStack'
import {
  entangledRenderLanes,
  setEntangledRenderLanes,
} from './ReactFiberWorkLoop'

const currentTreeHiddenStackCursor = createCursor(null)
const prevEntangledRenderLanesCursor = createCursor(NoLanes)

export function reuseHiddenContextOnStack() {
  push(prevEntangledRenderLanesCursor, entangledRenderLanes)
  push(currentTreeHiddenStackCursor, currentTreeHiddenStackCursor.current)
}

export function popHiddenContext() {
  setEntangledRenderLanes(prevEntangledRenderLanesCursor.current)
  pop(currentTreeHiddenStackCursor)
  pop(prevEntangledRenderLanesCursor)
}
