# 算法

## 1.1 双指针

## 1.2 二分查找

### 1.2.1 基本二分法

```javascript
function binary_search(nums, target) {
  let left = 0
  let right = nums.length - 1
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2)
    if (nums[mid] === target) {
      return mid
    } else if (nums[mid] > target) {
      right = mid - 1
    } else {
      left = mid + 1
    }
  }
  return -1
}
```

### 1.2.2 寻找左边界

```javascript
function left_bound(nums, target) {
  let left = 0
  let right = nums.length
  while (left < right) {
    const mid = left + Math.floor((right - left) / 2)
    if (nums[mid] === target) {
      right = mid
    } else if (nums[mid] > target) {
      right = mid
    } else {
      left = mid + 1
    }
  }
  if (left < 0 || left >= nums.length) return -1
  return nums[left] === target ? left : -1
}
```

### 1.2.3 寻找右边界

```javascript
function right_bound(nums, target) {
  let left = 0
  let right = nums.length
  while (left < right) {
    const mid = left + Math.floor((right - left) / 2)
    if (nums[mid] === target) {
      left = mid + 1
    } else if (nums[mid] > target) {
      right = mid
    } else {
      left = mid + 1
    }
  }
  if (left - 1 < 0 || left - 1 >= nums.length) return -1
  return nums[left - 1] === target ? left - 1 : -1
}
```

## 1.3 滑动窗口

给你一个字符串 s 、一个字符串 t 。返回 s 中涵盖 t 所有字符的最小子串。如果 s 中不存在涵盖 t 所有字符的子串，则返回空字符串 "" 。

示例 1：

输入：s = "ADOBECODEBANC", t = "ABC"

输出："BANC"

解释：最小覆盖子串 "BANC" 包含来自字符串 t 的 'A'、'B' 和 'C'。

```javascript
function minWindow(s, t) {
  const need = {}
  for (let i = 0; i < t.length; i++) {
    const c = t[i]
    need[c] = (need[c] || 0) + 1
  }
  const windows = {}
  let valid = 0
  let left = 0
  let right = 0
  let len = Number.MAX_VALUE
  let start = 0
  while (right < s.length) {
    const c = s[right]
    right++
    if (need[c]) {
      windows[c] = (windows[c] || 0) + 1
      if (windows[c] === need[c]) valid += 1
    }
    while (valid === Object.keys(need).length) {
      if (right - left < len) {
        len = right - left
        start = left
      }
      const d = s[left]
      left++
      if (need[d]) {
        if (windows[d] === need[d]) valid -= 1
        windows[d] -= 1
      }
    }
  }
  return len === Number.MAX_VALUE ? '' : s.substr(start, len)
}
```

## 1.4 单调栈

nums1 中数字 x 的 下一个更大元素 是指 x 在 nums2 中对应位置 右侧 的 第一个 比 x 大的元素。

给你两个 没有重复元素 的数组 nums1 和 nums2 ，下标从 0 开始计数，其中nums1 是 nums2 的子集。

对于每个 0 <= i < nums1.length ，找出满足 nums1[i] == nums2[j] 的下标 j ，并且在 nums2 确定 nums2[j] 的 下一个更大元素 。如果不存在下一个更大元素，那么本次查询的答案是 -1 。

返回一个长度为 nums1.length 的数组 ans 作为答案，满足 ans[i] 是如上所述的 下一个更大元素 。

示例 1：

输入：nums1 = [4,1,2], nums2 = [1,3,4,2]. 输出：[-1,3,-1] 解释：nums1 中每个值的下一个更大元素如下所述：

- 4 ，用加粗斜体标识，nums2 = [1,3,4,2]。不存在下一个更大元素，所以答案是 -1 。
- 1 ，用加粗斜体标识，nums2 = [1,3,4,2]。下一个更大元素是 3 。
- 2 ，用加粗斜体标识，nums2 = [1,3,4,2]。不存在下一个更大元素，所以答案是 -1 。示例 2：

输入：nums1 = [2,4], nums2 = [1,2,3,4]. 输出：[3,-1] 解释：nums1 中每个值的下一个更大元素如下所述：

- 2 ，用加粗斜体标识，nums2 = [1,2,3,4]。下一个更大元素是 3 。
- 4 ，用加粗斜体标识，nums2 = [1,2,3,4]。不存在下一个更大元素，所以答案是 -1 。

```javascript
function nextGreaterElement(nums1, nums2) {
  const res = []
  for (let i = 0; i < nums1.length; i++) {
    const index = nums2.findIndex(val => val === nums1[i])
    const s = []
    for (let j = nums2.length - 1; j > index; j--) {
      s.push(nums2[j])
      while (s.length && s[s.length - 1] <= nums2[index]) {
        s.pop()
      }
    }
    res.push(s.length === 0 ? -1 : s[s.length - 1])
  }
  return res
}
```

## 1.5 单调队列

给你一个整数数组 nums，有一个大小为 k 的滑动窗口从数组的最左侧移动到数组的最右侧。你只可以看到在滑动窗口内的 k 个数字。滑动窗口每次只向右移动一位。

返回 滑动窗口中的最大值 。

示例 1：

输入：nums = [1,3,-1,-3,5,3,6,7], k = 3

输出：[3,3,5,5,6,7]

解释：

```javascript
滑动窗口的位置                最大值
---------------               -----
[1  3  -1] -3  5  3  6  7       3
 1 [3  -1  -3] 5  3  6  7       3
 1  3 [-1  -3  5] 3  6  7       5
 1  3  -1 [-3  5  3] 6  7       5
 1  3  -1  -3 [5  3  6] 7       6
 1  3  -1  -3  5 [3  6  7]      7
```

示例 2：

输入：nums = [1], k = 1

输出：[1]

```javascript
function MonotonicQueue() {
  this.queue = []
}

MonotonicQueue.prototype.push = function (val) {
  while (
    this.queue.length &&
    this.queue[this.queue.length - 1] < val
  ) {
    this.queue.pop()
  }
  this.queue.push(val)
}

MonotonicQueue.prototype.pop = function (val) {
  if (val === this.queue[0]) this.queue.shift()
}

MonotonicQueue.prototype.max = function () {
  return this.queue[0]
}

function maxSlidingWindow(nums, k) {
  const queue = MonotonicQueue()
  const res = []
  for (let i = 0; i < nums.length; i++) {
    if (i < k - 1) {
      queue.push(nums[i])
    } else {
      queue.push(nums[i])
      res.push(queue.max())
      queue.pop(nums[i - k + 1])
    }
  }
  return res
}
```

## 1.6 回溯算法

给定一个不含重复数字的数组 nums ，返回其 所有可能的全排列 。你可以 按任意顺序 返回答案。

示例 1：

> 输入：nums = [1,2,3]
>
> 输出：[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]

示例 2：

> 输入：nums = [0,1]
>
> 输出：[[0,1],[1,0]]

示例 3：

> 输入：nums = [1]
>
> 输出：[[1]]

```javascript
function permute(nums) {
  const res = []
  const track = []
  const used = new Array(nums.length).fill(false)
  function backtrack() {
    if (track.length === nums.length) {
      res.push([...track])
      return
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue
      track.push(nums[i])
      used[i] = true
      backtrack()
      used[i] = false
      track.pop()
    }
  }
  backtrack()
  return res
}
```

## 1.7 BFS算法

你有一个带有四个圆形拨轮的转盘锁。每个拨轮都有10个数字： '0', '1', '2', '3', '4', '5', '6', '7', '8', '9' 。每个拨轮可以自由旋转：例如把 '9' 变为 '0'，'0' 变为 '9' 。每次旋转都只能旋转一个拨轮的一位数字。

锁的初始数字为 '0000' ，一个代表四个拨轮的数字的字符串。

列表 deadends 包含了一组死亡数字，一旦拨轮的数字和列表里的任何一个元素相同，这个锁将会被永久锁定，无法再被旋转。

字符串 target 代表可以解锁的数字，你需要给出解锁需要的最小旋转次数，如果无论如何不能解锁，返回 -1 。

示例 1:

> 输入：deadends = ["0201","0101","0102","1212","2002"], target = "0202"
>
> 输出：6
>
> 解释：
>
> 可能的移动序列为 "0000" -> "1000" -> "1100" -> "1200" -> "1201" -> "1202" -> "0202"。
>
> 注意 "0000" -> "0001" -> "0002" -> "0102" -> "0202" 这样的序列是不能解锁的，
>
> 因为当拨动到 "0102" 时这个锁就会被锁定。

```javascript
function plusOne(cur, i) {
  const tmp = cur.split('')
  if (tmp[i] === '9') tmp[i] = '0'
  else tmp[i] = `${Number(tmp[i]) + 1}`
  return tmp.join('')
}

function minusOne(cur, i) {
  const tmp = cur.split('')
  if (tmp[i] === '0') tmp[i] = '9'
  else tmp[i] = `${Number(tmp[i]) - 1}`
  return tmp.join('')
}

function getNeighbors(cur) {
  const neighbors = []
  for (let i = 0; i < 4; i++) {
    neighbors.push(plusOne(cur, i))
    neighbors.push(minusOne(cur, i))
  }
  return neighbors
}

function openLock(deadends, target) {
  deadends = new Set(deadends)
  if (deadends.has('0000')) return -1
  const queue = ['0000']
  const visited = new Set()
  visited.add('0000')
  let step = 0
  while (queue.length) {
    const len = queue.length
    for (let i = 0; i < len; i++) {
      const cur = queue.shift()
      if (cur === target) return step
      const neighbors = getNeighbors(cur)
      for (const n of neighbors) {
        if (visited.has(n) || deadends.has(n)) continue
        queue.push(n)
        visited.add(n)
      }
    }
    step++
  }
  return -1
}
```

## 1.8 排序算法

### 1.8.1 快速排序

```javascript
function quickSort(nums, start, end) {
  if (start >= end) return
  const mid = start + Math.floor((end - start) / 2)
  ;[nums[mid], nums[end]] = [nums[end], nums[mid]]
  const pivot = nums[end]
  let i = start - 1
  for (let j = start; j <= end - 1; j++) {
    if (nums[j] <= pivot) {
      i++
      ;[nums[i], nums[j]] = [nums[j], nums[i]]
    }
  }
  ;[nums[i + 1], nums[end]] = [nums[end], nums[i + 1]]
  i++
  quickSort(nums, start, i - 1)
  quickSort(nums, i + 1, end)
}
quickSort(nums, 0, nums.length - 1)
```

### 1.8.2 归并排序

```javascript
function mergeSort(arr) {
  if (arr.length < 2) return arr

  const mid = Math.floor(arr.length / 2)
  const left = mergeSort(arr.slice(0, mid))
  const right = mergeSort(arr.slice(mid + 1, arr.length))
  const res = []

  while (left.length && right.length) {
    if (left[0] < right[0]) {
      res.push(left.shift())
    } else {
      res.push(right.shift())
    }
  }
  while (left.length) {
    res.push(left.shift())
  }
  while (right.length) {
    res.push(right.shift())
  }
  return res
}
```
