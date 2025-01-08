# React

## 一. Hook

### 1.1 useState

#### 使用准则

- 当连续调用`dispatch`方法修改`state`值时应该传入回调方法进行修改，而不是直接传入修改的值
  例如下面这段代码的 bad case，我们连续调用 setCount 方法，通过直接赋值的方式，那么由于这三次 setCount 使用的 count 值都是相同，都是 1，那么每次 setCount 赋值结果都是 2，所以 count 值最终结果就是 2，正确的方式应该是通过传入回调方式赋值，通过回调获取最新的 count 值，然后+1 再返回新的 count 值。

  ```javascript
  // bad
  const [count, setCount] = useState(1);

  function handleClick() {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
    // 最终结果count值为2
  }

  // good
  const [count, setCount] = useState(1);

  function handleClick() {
    setCount((state) => state + 1);
    setCount((state) => state + 1);
    setCount((state) => state + 1);
    // 最终结果count值为4
  }
  ```

- 当 state 是对象或着数组时，修改 state 值不要直接修改原始对象或者数组属性值，而是创建新的对象和数组，基于此进行修改
  例如下面这段代码的 bad case，我们直接修改当前 state 的属性值，这种方式并不会触发重新渲染，因为 react 是通过 Object.is 的方式进行比对，不会判断属性值是否变更，正确方式应该是创建新的对象，修改新对象属性值

  ```javascript
  // bad
  const [person, setPerson] = useState({ name: "jack", age: 10 });

  function handleClick() {
    person.name = "lisi";
    setPerson(perosn);
  }

  // good
  const [person, setPerson] = useState({ name: "jack", age: 10 });

  function handleClick() {
    setPerson({
      ...person,
      name: "lisi",
    });
  }
  ```

- 不要重复创建 state 初始值
  例如下面这段代码中的 bad case，我们调用 getCount 方法返回 count 初始值，这种方式会导致每次渲染都会执行一次 getCount 方法，但是没有意义的，因为 count 的初始值只有首次渲染时才会赋值，重新渲染不会再使用 getCount 返回结果进行赋值，所以最佳方式是传入 getCount 方法，react 在首次渲染时会调用 getCount 方法获取返回值作为初始值进行赋值。

  ```javascript
  // bad
  const [count, setCount] = useState(getCount());

  // good
  const [count, setCount] = useState(getCount);
  ```

### 1.2 useEffect

- 采用深度优先遍历算法调用 useEffect 的 setup 和 destroy
- 通过 Object.is 方法比较 deps
- 页面渲染完成之后执行

### 1.3 useRef

- 更改 ref 值不会触发更新渲染

### 1.4 useLayoutEffect

- 采用深度优先遍历算法调用 useLayoutEffect 的 setup 和 destroy
- 通过 Object.is 方法比较 deps
- 页面渲染完成之前执行

## 二. 原理

#### 2.1 [手写 mini React，理解 React 渲染原理](https://juejin.cn/post/7455612245768241192)

#### 2.2 [手写 React useState，理解 useState 原理](https://juejin.cn/post/7456265285852299264)

#### 2.3 [手写 React useEffect, 理解 useEffect 原理](https://juejin.cn/post/7456647661548453940)

#### 2.4 [手写 React useLayoutEffect, 理解 useLayoutEffect 原理](https://juejin.cn/post/7457151932395913216)

#### 2.5 [手写 React useRef，理解 useRef 原理](https://juejin.cn/post/7456796962119450658)

#### 2.6 [手写 React useReducer，理解 useReducer 原理](https://juejin.cn/post/7457434262561112098)
