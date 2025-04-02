import {
  syncLaneExpirationMs,
  transitionLaneExpirationMs,
} from '../shared/ReactFeatureFlags'

export const NoLanes = 0
export const SyncLane = /*                        */ 0b0000000000000000000000000000010 // 2
export const InputContinuousLane = /*             */ 0b0000000000000000000000000001000 // 8
export const DefaultHydrationLane = /*            */ 0b0000000000000000000000000010000 // 16
export const DefaultLane = /*                     */ 0b0000000000000000000000000100000 // 32
export const IdleLane = /*                        */ 0b0010000000000000000000000000000
export const InputContinuousHydrationLane = /*    */ 0b0000000000000000000000000000100
export const DeferredLane = /*                    */ 0b1000000000000000000000000000000
const NonIdleLanes = /*                           */ 0b0000111111111111111111111111111
const TransitionLanes = /*                        */ 0b0000000001111111111111110000000
const TransitionLane1 = /*                        */ 0b0000000000000000000000010000000 // 128
const TransitionLane2 = /*                        */ 0b0000000000000000000000100000000
const TransitionLane3 = /*                        */ 0b0000000000000000000001000000000
const TransitionLane4 = /*                        */ 0b0000000000000000000010000000000
const TransitionLane5 = /*                        */ 0b0000000000000000000100000000000
const TransitionLane6 = /*                        */ 0b0000000000000000001000000000000
const TransitionLane7 = /*                        */ 0b0000000000000000010000000000000
const TransitionLane8 = /*                        */ 0b0000000000000000100000000000000
const TransitionLane9 = /*                        */ 0b0000000000000001000000000000000
const TransitionLane10 = /*                       */ 0b0000000000000010000000000000000
const TransitionLane11 = /*                       */ 0b0000000000000100000000000000000
const TransitionLane12 = /*                       */ 0b0000000000001000000000000000000
const TransitionLane13 = /*                       */ 0b0000000000010000000000000000000
const TransitionLane14 = /*                       */ 0b0000000000100000000000000000000
const TransitionLane15 = /*                       */ 0b0000000001000000000000000000000
const RetryLanes = /*                             */ 0b0000011110000000000000000000000

let nextTransitionLane = TransitionLane1

export const SyncUpdateLanes = SyncLane | InputContinuousLane | DefaultLane

export const TotalLanes = 31
export const NoTimestamp = -1

export function createLaneMap(initial) {
  const laneMap = []
  for (let i = 0; i < TotalLanes; i++) {
    laneMap.push(initial)
  }
  return laneMap
}

function pickArbitraryLaneIndex(lanes) {
  return 31 - Math.clz32(lanes)
}

function getHighestPriorityLanes(lanes) {
  const pendingSyncLanes = lanes & SyncUpdateLanes
  if (pendingSyncLanes !== NoLanes) return pendingSyncLanes
  switch (lanes) {
    case DefaultLane:
      return DefaultLane
    case DefaultHydrationLane:
      return DefaultHydrationLane
    case TransitionLane1:
    case TransitionLane2:
    case TransitionLane3:
    case TransitionLane4:
    case TransitionLane5:
    case TransitionLane6:
    case TransitionLane7:
    case TransitionLane8:
    case TransitionLane9:
    case TransitionLane10:
    case TransitionLane11:
    case TransitionLane12:
    case TransitionLane13:
    case TransitionLane14:
    case TransitionLane15:
      return lanes & TransitionLanes
  }
}

export function getNextLanes(root, wipLanes) {
  const pendingLanes = root.pendingLanes
  if (pendingLanes === NoLanes) return NoLanes
  const nextLanes = getHighestPriorityLanes(pendingLanes)
  if (wipLanes !== NoLanes && wipLanes !== nextLanes) {
    if (
      nextLanes > wipLanes ||
      (nextLanes === DefaultLane && (wipLanes & TransitionLanes) !== NoLanes)
    )
      return wipLanes
  }
  return nextLanes
}

export function markRootUpdated(root, updateLane) {
  root.pendingLanes |= updateLane
}

export function claimNextTransitionLane() {
  const lane = nextTransitionLane
  nextTransitionLane <<= 1
  if ((nextTransitionLane & TransitionLanes) === NoLanes) {
    nextTransitionLane = TransitionLane1
  }
  return lane
}

function computeExpirationTime(lane, currentTime) {
  switch (lane) {
    case SyncLane:
      return currentTime + syncLaneExpirationMs
    case DefaultLane:
    case TransitionLane1:
    case TransitionLane2:
    case TransitionLane3:
    case TransitionLane4:
    case TransitionLane5:
    case TransitionLane6:
    case TransitionLane7:
    case TransitionLane8:
    case TransitionLane9:
    case TransitionLane10:
    case TransitionLane11:
    case TransitionLane12:
    case TransitionLane13:
    case TransitionLane14:
    case TransitionLane15:
      return currentTime + transitionLaneExpirationMs
  }
}

export function includesNonIdleWork(lanes) {
  return (lanes & NonIdleLanes) !== NoLanes
}

export function includesBlockingLane(lanes) {
  const SyncDefaultLanes =
    InputContinuousHydrationLane |
    InputContinuousLane |
    DefaultHydrationLane |
    DefaultLane
  return (lanes & SyncDefaultLanes) !== NoLanes
}

export function includesExpiredLane(root, lanes) {
  return (root.expiredLanes & lanes) !== NoLanes
}

// 获取关联优先级，例如DeferredLane
export function getEntangledLanes(root, renderLanes) {
  let entangledLanes = renderLanes
  const allEntangledLanes = root.entangledLanes
  if (allEntangledLanes !== NoLanes) {
    const entanglements = root.entanglements
    let lanes = entangledLanes & allEntangledLanes
    while (lanes > 0) {
      const index = pickArbitraryLaneIndex(lanes)
      const lane = 1 << index
      entangledLanes |= entanglements[index]
      lanes &= ~lane
    }
  }
  return entangledLanes
}

// 记录DeferredLane
function markSpawnedDeferredLane(root, spawnedLane) {
  root.pendingLanes |= spawnedLane
  const spawnedLaneIndex = pickArbitraryLaneIndex(spawnedLane)
  root.entangledLanes |= spawnedLane
  root.entanglements[spawnedLaneIndex] |= DeferredLane
}

/**
 * @param {*} root FiberRootNode对象
 * @param {*} remainingLanes 在下次更新渲染优先级
 * @param {*} spawnedLane workInProgressDeferredLane
 */
export function markRootFinished(root, remainingLanes, spawnedLane) {
  const previouslyPendingLanes = root.pendingLanes
  const noLongerPendingLanes = previouslyPendingLanes & ~remainingLanes
  root.pendingLanes = remainingLanes
  root.expiredLanes &= remainingLanes
  root.entangledLanes &= remainingLanes
  const entanglements = root.entanglements
  const expirationTimes = root.expirationTimes

  let lanes = noLongerPendingLanes
  while (lanes > 0) {
    const index = pickArbitraryLaneIndex(lanes)
    const lane = 1 << index
    entanglements[index] = NoLanes
    expirationTimes[index] = NoTimestamp
    lanes &= ~lane
  }
  if (spawnedLane !== NoLanes) {
    markSpawnedDeferredLane(root, spawnedLane)
  }
}

// 记录任务过期时间
export function markStarvedLanesAsExpired(root, currentTime) {
  const pendingLanes = root.pendingLanes
  const expirationTimes = root.expirationTimes
  let lanes = pendingLanes & ~RetryLanes
  while (lanes > 0) {
    const index = pickArbitraryLaneIndex(lanes)
    const lane = 1 << index
    const expirationTime = expirationTimes[index]
    if (expirationTime === NoTimestamp) {
      expirationTimes[index] = computeExpirationTime(lane, currentTime)
    } else if (expirationTime < currentTime) {
      root.expiredLanes |= lane
    }
    lanes &= ~lane
  }
}
