// 表示该FiberNode节点无需处理
export const NoFlags = 0
// 表示该FiberNode节点是新增节点，需要插入DOM树中
export const Placement = 2
// 表示该FiberNode节点需要更新处理
export const Update = 4
// 表示该FiberNode节点有子节点要删除
export const ChildDeletion = 16
// 表示该FiberNode节点有useEffect处理逻辑
export const Passive = 2048
// 表示该FiberNode节点有useRef处理逻辑
export const Ref = 512
