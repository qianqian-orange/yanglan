# JavaScript
## 一. 什么是JavaScript
JavaScript是一种脚本编程语言，可以实现复杂的交互和功能。

## 二. 变量类型
- `Number`
- `String`
- `Boolean`
- `Array`
- `Object`

## 三. 函数
- 函数声明
- 立执行函数
- 箭头函数

## 四. 事件
- 事件冒泡
- 事件捕获
- 事件委托

## 五. this指针
关键字`this`指向当前代码运行时的对象。参考文档：https://segmentfault.com/a/1190000010981003

## 六. 原型
- js对象分为函数对象和普通对象，每个对象都有`__proto__`属性，但只有函数对象才有`prototype`属性
- 每个对象的`__proto__`指向创建它的构造函数的原型
- 每个原型对象的`constructor`记录实例是由哪个构造函数创建的

![原型链](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d9afcd1172d340508d25c095b1103fac~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

## 七. 对象
- 继承
- 私有属性/私有方法
  
  在变量名前加`#`

## 八. 原理
### 弱比较`==`
- x和y的类型是否相同，如果相同比较值是否相同
- x和y为`null`和`undefined`，返回true
- x和y为`String`和`Number`，将`String`转成`Number`再比较
- x和y其中一方为`Boolean`类型，将`Boolean`类型改成`Number`类型再比较
- x和y一方为`Object`，另一方为`String`、`Number`或`Symbol`类型，将`Object`类型改成基础数据类型再比较
- 返回false

### 对象转基本数据类型
- 调用`Symbol.toPrimitive`，如果转为原始类型则返回
- 调用`valueOf`方法，如果转为原始类型则返回
- 调用`toString`f昂奋，如果转为原始类型则返回
- 报错

### 函数式编程
特点
  - 纯函数，稳定的输入输出
  - 无状态，不依赖全局变量、this指针
  - 惰性执行
  - 没有副作用

缺点
  - 性能: 需要占用更多的上下文切换开销
  - 递归陷阱
  - 资源占用: 因为不可变性，意味着会创建新的对象

```js
function curry(fn, args) {
  args = args || [];
  return function () {
    let _args = args.concat([].slice.call(arguments));
    if (_args.length < fn.length) {
      return curry.call(this, fn, _args);
    } else {
      return fn.apply(this, _args);
    }
  }
}
```

### instanceof
比较原型对象是否相同
```js
function myInstanceof(left, right) {
  if (left === null || typeof left !== 'object') return false;
  let proto = left.__proto__;
  while(true) {
    if (proto === null) return false;
    if (proto === right.prototype) return true;
    proto = proto.__proto__;
  }
}
```

### new
```js
function objectFactory(constructor, ...args) {
  let obj = new Object();
  obj.__proto__ = constructor.prototype;
  let res = constructor.apply(obj, args);
  return typeof res === 'object' && res !== null ? res : obj;
}
```

### call
```js
Function.prototype.call = function (context, ...args) {
  if (typeof this !== 'function') {
    return TypeError(this + 'is no a function');
  }
  context = context || globalThis;
  context.fn = this;
  let result = context.fn(...args);
  delete context.fn;
  return result;
}
```

### apply
```js
Function.prototype.apply = function (context, args) {
  if (typeof context !== 'function') {
    return TypeError(this + 'is no a function');
  }
  context = context || globalThis;
  context.fn = this;
  let result = context.fn(...args);
  delete context.fn;
  return result;
}
```

### bind
```js
Function.prototype.bind = function(context, ...args) {
  if (typeof this !== 'function') {
    throw TypeError(this + `is no a function`);
  }
  let self = this;
  context = context || globalThis;
  let F = function () {
    return self.apply(this instanceof F ? this : context, args.concat([].slice.call(arguments)));
  }
  F.prototype = Object.create(self.prototype);
  return F;
}
```

### Object.create
```js
function create(o) {
  function F() {}
  F.prototype = o;
  return new F();
}
```

### Object.is
用于判断x和y是否相同，它解决了`===`不能正确判断`+0`和`-0`，`NaN`和`NaN`这两种情况
```js
function is(x, y) {
  if (x === y) {
    // 当x为`+0`, y为`-0`时应该返回false
    // 1 / +0 = +Infinity
    // 1 / -0 = -Infinity
    // +Infinity !== -Infinity
    return x !== 0 || y !== 0 || 1 / x === 1 / y;
  } else {
    // 当x为NaN, y为NaN时应该返回true
    return x !== x && y !== y;
  }
}
```

### throttle
当持续触发事件时，保证一定时间内只执行一次事件处理函数
```js
function throttle(fn, delay) {
  let timer, now, context, args;
  let previous = 0;

  function throttled() {
    context = this;
    args = arguments;
    now = Date.now();
    let residue = delay - (now - previous);
    if (residue <= 0 || residue > delay) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      fn.apply(context, args);
      previous = now;
    } else (!timer) {
      timer = setTimeout(() => {
        fn.apply(context, args);
        timer = null;
        previous = Date.now();
      }, residue);
    }
  }

  return throttled;
}
```

### debounce
当持续触发事件时，一定时间内没有再触发事件时才执行一次事件处理函数
```js
function debounce(fn, delay) {
  let timer, context, args;

  function debounced() {
    context = this;
    args = arguments;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    timer = setTimeout(() => {
      fn.apply(context, args);
      timer = null;
    }, delay);
  }

  return debounced;
}
```

### Promise
参考文档: https://juejin.cn/post/6844903796129136654
```js
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

function Promise(executor) {
  this.status = PENDING;
  this.value = null;
  this.reason = null;
  this.onfulfilled = [];
  this.onrejected = [];

  this.resolve = (value) => {
    if (this.status !== PENDING) return;
    this.status = FULFILLED;
    this.value = value;
    this.onfulfilled.forEach(fn => fn());
  }

  this.reject = (reason) => {
    if (this.status !== PENDING) return;
    this.status = REJECTED;
    this.reason = reason;
    this.onrejected.forEach(fn => fn());
  }

  try {
    executor(this.resolve, this.reject);
  } catch(e) {
    this.reject(e);
  }
}

function resolveResult(promise, result, resolve, reject) {
  if (promise === result) throw Error('chaining circle');
  if (result instanceof Object) {
    const then = result.then;
    if (typeof then === 'function') {
      then.call(result, (value) => {
        resolve(value);
      }, (reason) => {
        reject(reason);
      });
    } else {
      resolve(result);
    }
  } else {
    resolve(result);
  }
}

Promise.prototype.then = function (onFulfilled = value => value, onRejected = e => { throw e }) {
  const self = this;
  let promise = new Promise((resolve, reject) => {
    switch (self.status) {
      case PENDING:
        self.onfulfilled.push(() => {
          try {
            const result = onFulfilled(self.value);
            resolveResult(promise, result, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
        self.onrejected.push(() => {
          try {
            const result = onRejected(self.reason);
            resolveResult(promise, result, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
        break;
      case FULFILLED:
        try {
          const result = onFulfilled(self.value);
          resolveResult(promise, result, resolve, reject);
        } catch (e) {
          reject(e);
        }
        break;
      case REJECTED:
        try {
          const result = onRejected(self.reason);
          resolveResult(promise, result, resolve, reject);
        } catch (e) {
          reject(e);
        }
        break;
    }
    return promise;
  });
}
```