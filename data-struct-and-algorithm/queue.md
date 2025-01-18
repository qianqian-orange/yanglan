# 队列

特点: 先进先出

## 用栈实现队列

```javascript
function Queue() {
  this.s1 = []
  this.s2 = []
}

Queue.prototype.push = function (val) {
  this.s1.push(val)
}

Queue.prototype.pop = function () {
  this.peek()
  return this.s1.pop()
}

Queue.prototype.peek = function () {
  if (this.s2.length === 0) {
    while (this.s1.length) {
      this.s2.push(this.s1.pop())
    }
  }
  return this.s2[this.s2.length - 1]
}

Queue.prototype.empty = function () {
  return this.s1.length === 0 && this.s2.length === 0
}
```
