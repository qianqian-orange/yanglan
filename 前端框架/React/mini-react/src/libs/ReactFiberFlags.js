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

export const PassiveMask = Passive | ChildDeletion
