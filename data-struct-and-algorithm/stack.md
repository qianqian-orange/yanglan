# 栈

特点: 先进后出

## 用队列实现栈

```javascript
function Stack() {
  this.queue = []
}

Stack.prototype.push = function (val) {
  this.queue.push(val)
}

Stack.prototype.pop = function () {
  return this.quue.pop()
}

Stack.prototype.top = function () {
  return this.queue[this.queue.length - 1]
}

Stack.prototype.empty = function () {
  return this.queue.length === 0
}
```
