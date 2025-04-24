// 表示该FiberNode节点无需处理
export const NoFlags = 0
// 表示该FiberNode节点是新增节点，需要插入DOM树中
export const Placement = /*                        */ 0b0000000000000000000000000010 // 2
// 表示该FiberNode节点需要更新处理
export const Update = /*                           */ 0b0000000000000000000000000100 // 4
// 表示该FiberNode节点有子节点要删除
export const ChildDeletion = /*                    */ 0b0000000000000000000000010000 // 16
// 表示该FiberNode节点有effect处理逻辑
export const Passive = /*                          */ 0b0000000000000000100000000000 // 2048
// 表示该FiberNode节点有ref处理逻辑
export const Ref = /*                              */ 0b0000000000000000001000000000 // 512
// 表示需要清空根FiberNode节点对应的dom节点内容
export const Snapshot = /*                         */ 0b0000000000000000000010000000000 // 1024

export const Visibility = /*                       */ 0b0000000000000000010000000000000 // 8192
// 判断Suspense组件是否要展示fallback组件
export const DidCapture = /*                       */ 0b0000000000000000000000010000000 // 128
export const Hydrating = /*                        */ 0b0000000000000000001000000000000 // 4096

export const Incomplete = /*                       */ 0b0000000000000001000000000000000 // 32768
export const ShouldCapture = /*                    */ 0b0000000000000010000000000000000 // 65536

export const StoreConsistency = /*                 */ 0b0000000000000000100000000000000 // 16384
export const ScheduleRetry = StoreConsistency

export const PassiveMask = Passive | ChildDeletion

export const HostEffectMask = /*                   */ 0b0000000000000000111111111111111 // 32767
