import {
  DefaultLane,
  IdleLane,
  InputContinuousLane,
  NoLanes,
  SyncLane,
} from '../ReactFiberLane'

export const NoEventPriority = NoLanes
export const DiscreteEventPriority = SyncLane
export const ContinuousEventPriority = InputContinuousLane
export const DefaultEventPriority = DefaultLane
export const IdleEventPriority = IdleLane
