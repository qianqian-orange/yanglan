import {
  syncLaneExpirationMs,
  transitionLaneExpirationMs,
} from '../shared/ReactFeatureFlags'

export const NoLanes = 0
// 同步更新优先级
export const SyncLane = /*                        */ 0b0000000000000000000000000000010 // 2
export const InputContinuousLane = /*             */ 0b0000000000000000000000000001000 // 8
// 首次渲染hydrate优先级
export const DefaultHydrationLane = /*            */ 0b0000000000000000000000000010000 // 16
// 首次渲染默认优先级
export const DefaultLane = /*                     */ 0b0000000000000000000000000100000 // 32
export const IdleLane = /*                        */ 0b0010000000000000000000000000000 // 268435456
export const InputContinuousHydrationLane = /*    */ 0b0000000000000000000000000000100 // 4
export const OffscreenLane = /*                   */ 0b0100000000000000000000000000000 // 536870912
// useDeferredValue相关优先级
export const DeferredLane = /*                    */ 0b1000000000000000000000000000000 // 1073741824
const NonIdleLanes = /*                           */ 0b0000111111111111111111111111111 // 134217727
// 延迟更新优先级
const TransitionLanes = /*                        */ 0b0000000001111111111111110000000 // 4194176
const TransitionLane1 = /*                        */ 0b0000000000000000000000010000000 // 128
const TransitionLane2 = /*                        */ 0b0000000000000000000000100000000 // 256
const TransitionLane3 = /*                        */ 0b0000000000000000000001000000000 // 512
const TransitionLane4 = /*                        */ 0b0000000000000000000010000000000 // 1024
const TransitionLane5 = /*                        */ 0b0000000000000000000100000000000 // 2048
const TransitionLane6 = /*                        */ 0b0000000000000000001000000000000 // 4096
const TransitionLane7 = /*                        */ 0b0000000000000000010000000000000 // 8192
const TransitionLane8 = /*                        */ 0b0000000000000000100000000000000 // 16384
const TransitionLane9 = /*                        */ 0b0000000000000001000000000000000 // 32768
const TransitionLane10 = /*                       */ 0b0000000000000010000000000000000 // 65536
const TransitionLane11 = /*                       */ 0b0000000000000100000000000000000 // 131072
const TransitionLane12 = /*                       */ 0b0000000000001000000000000000000 // 262144
const TransitionLane13 = /*                       */ 0b0000000000010000000000000000000 // 524288
const TransitionLane14 = /*                       */ 0b0000000000100000000000000000000 // 1048576
const TransitionLane15 = /*                       */ 0b0000000001000000000000000000000 // 2097152
// 异步操作优先级
const RetryLanes = /*                             */ 0b0000011110000000000000000000000 // 62914560
const RetryLane1 = /*                             */ 0b0000000010000000000000000000000 // 4194304
const RetryLane2 = /*                             */ 0b0000000100000000000000000000000 // 8388608
const RetryLane3 = /*                             */ 0b0000001000000000000000000000000 // 16777216
const RetryLane4 = /*                             */ 0b0000010000000000000000000000000 // 33554432

let nextTransitionLane = TransitionLane1
let nextRetryLane = RetryLane1

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
    case OffscreenLane:
      return OffscreenLane
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
    case RetryLane1:
    case RetryLane2:
    case RetryLane3:
    case RetryLane4:
      return lanes & RetryLanes
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
  if ((nextTransitionLane & TransitionLanes) === NoLanes)
    nextTransitionLane = TransitionLane1
  return lane
}

export function claimNextRetryLane() {
  const lane = nextRetryLane
  nextRetryLane <<= 1
  if ((nextRetryLane & RetryLanes) === NoLanes) nextRetryLane = RetryLane1
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
 * @param {*} remainingLanes 下次更新渲染优先级
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
