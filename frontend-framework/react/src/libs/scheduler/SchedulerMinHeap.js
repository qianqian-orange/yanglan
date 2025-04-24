// 按照过期时间构建最小堆，过期时间短排在前，过期时间长排在后
// 如果过期时间相同的，按照添加任务顺序进行排序，先添加的排在前，后添加的排在后

const compare = (a, b) => {
  const diff = a.sortIndex - b.sortIndex
  return diff !== 0 ? diff : a.id - b.id
}

const siftUp = (heap, node, childIndex) => {
  while (childIndex > 0) {
    const parentIndex = Math.floor((childIndex - 1) / 2)
    const parent = heap[parentIndex]
    if (compare(parent, node) > 0) {
      heap[parentIndex] = node
      heap[childIndex] = parent
      childIndex = parentIndex
      continue
    }
    break
  }
}

const siftDown = (heap, node, parentIndex) => {
  while (true) {
    let leftChildIndex = parentIndex * 2 + 1
    let leftChild = heap[leftChildIndex]
    let rightChildIndex = leftChildIndex + 1
    let rightChild = heap[rightChildIndex]
    if (leftChildIndex >= heap.length) break
    if (compare(node, leftChild) > 0) {
      if (rightChildIndex < heap.length && compare(leftChild, rightChild) > 0) {
        heap[parentIndex] = rightChild
        heap[rightChildIndex] = node
        parentIndex = rightChildIndex
      } else {
        heap[parentIndex] = leftChild
        heap[leftChildIndex] = node
        parentIndex = leftChildIndex
      }
    } else if (rightChildIndex < heap.length && compare(node, rightChild) > 0) {
      heap[parentIndex] = rightChild
      heap[rightChildIndex] = node
      parentIndex = rightChildIndex
    } else {
      break
    }
  }
}

export const peek = heap => {
  return heap.length === 0 ? null : heap[0]
}

// 添加一个任务
export const push = (heap, node) => {
  const index = heap.length
  heap.push(node)
  // 向上调整最小堆
  siftUp(heap, node, index)
}

export const pop = heap => {
  if (heap.length === 0) return null
  const first = heap[0]
  const last = heap.pop()
  if (first !== last) {
    heap[0] = last
    // 向下调整最小堆
    siftDown(heap, last, 0)
  }
  return first
}
