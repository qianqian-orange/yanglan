# React

## 一. Hook

### 1.1 useState

#### 使用准则

- 当连续调用`dispatch`方法修改`state`值时应该传入回调方法进行修改，而不是直接传入修改的值

  例如下面这段代码的 bad case，我们连续调用 setCount 方法，通过直接赋值的方式，那么由于这三次 setCount 使用的 count 值都是相同，都是 1，那么每次 setCount 赋值结果都是 2，所以 count 值最终结果就是 2，正确的方式应该是通过传入回调方式赋值，通过回调获取最新的 count 值，然后+1 再返回新的 count 值。

  ```javascript
  // bad
  const [count, setCount] = useState(1)

  function handleClick() {
    setCount(count + 1)
    setCount(count + 1)
    setCount(count + 1)
    // 最终结果count值为2
  }

  // good
  const [count, setCount] = useState(1)

  function handleClick() {
    setCount(state => state + 1)
    setCount(state => state + 1)
    setCount(state => state + 1)
    // 最终结果count值为4
  }
  ```

- 当 state 是对象或着数组时，修改 state 值不要直接修改原始对象或者数组属性值，而是创建新的对象和数组，基于此进行修改

  例如下面这段代码的 bad case，我们直接修改当前 state 的属性值，这种方式并不会触发重新渲染，因为 react 是通过 Object.is 的方式进行比对，不会判断属性值是否变更，正确方式应该是创建新的对象，修改新对象属性值

  ```javascript
  // bad
  const [person, setPerson] = useState({ name: 'jack', age: 10 })

  function handleClick() {
    person.name = 'lisi'
    setPerson(perosn)
  }

  // good
  const [person, setPerson] = useState({ name: 'jack', age: 10 })

  function handleClick() {
    setPerson({
      ...person,
      name: 'lisi',
    })
  }
  ```

- 不要重复创建 state 初始值

  例如下面这段代码中的 bad case，我们调用 getCount 方法返回 count 初始值，这种方式会导致每次渲染都会执行一次 getCount 方法，但是没有意义的，因为 count 的初始值只有首次渲染时才会赋值，重新渲染不会再使用 getCount 返回结果进行赋值，所以最佳方式是传入 getCount 方法，react 在首次渲染时会调用 getCount 方法获取返回值作为初始值进行赋值。

  ```javascript
  // bad
  const [count, setCount] = useState(getCount())

  // good
  const [count, setCount] = useState(getCount)
  ```

### 1.2 useReducer

`useReducer`方法接收两个参数，第一个参数是`reducer function`，执行变更`state`的代码逻辑，第二个参数是`state`初始值

`useReducer`方法返回一个数组，第一个数组元素是`state`，第二个数组元素是触发更新渲染方法

### 1.3 useEffect

`useEffect`方法接收两个参数，第一个是执行函数`create`，第二个是依赖`deps`，在首次渲染时会执行一次`create`方法，在下次渲染时会比对`deps`值是否变更，如果有会再次执行`create`方法

我们可以在`create`方法里返回一个函数`destroy`，`destroy`方法会在`deps`值发生变化或组件卸载时执行。

### 1.4 useLayoutEffect

`useLayoutEffect`方法接收两个参数，第一个是执行函数`create`，第二个是依赖`deps`，在首次渲染时会执行一次`create`方法，在下次渲染时会比对`deps`值是否变更，如果有会再次执行`create`方法。

我们可以在`create`方法里返回一个函数`destroy`，`destroy`方法会在`deps`值发生变化或组件卸载时执行。

与`useEffect`差异点是执行时机不同：`useEffect`是页面完成渲染之后执行，`useLayoutEffect`是页面完成渲染之前执行。

### 1.5 useRef

`useRef`方法接收一个可选初始值入参，会赋值给`ref`的`current`属性，可以通过`ref.current`获取属性值或修改属性值，需要注意的是修改`ref.current`属性值不会触发更新渲染逻辑

### 1.6 useMemo

`useMemo`方法接收两个参数，第一个参数是执行函数`nextCreate`，第二个参数是依赖`deps`，首次渲染会调用`nextCreate`方法获取返回值，更新渲染会比对`deps`是否想通过，不相同会重新调用`nextCreate`方法获取新的返回值。

### 1.7 useCallback

`useCallback`方法接收两个参数，第一个参数是`cache function`，第二个参数是依赖`deps`，首次渲染调用会直接返回`cache function`，更新渲染会比对`deps`是否相同，不相同返回新的`cache function`

### 1.8 useDeferredValue

`useDeferredValue`方法接收两个参数，第一个入参是延迟更新`value`，第二个入参是初始值，如果有传初始化，则`useDeferredValue`方法返回初始值，没有传初始值则返回延迟更新`value`

### 1.9 useImperativeHandle

`useImperativeHandle`方法接收三个参数，第一个参数是`ref`对象，第二个参数是`create`方法，会调用`create`方法将返回值赋值给`ref.current`属性，第三个参数是依赖`deps`，当依赖`deps`发生变化时会重新调用`create`获取新的返回值赋值给`ref.current`

### 1.10 useSyncExternalStore

`useSyncExternalStore`方法接收三个参数，第一个参数是监听事件函数，第二个参数是获取数据方法，第三个参数是服务端渲染时调用的方法

### 1.1 useContext

`useContext`方法接收一个参数`Context`，返回`Context`记录的属性值

## 二. 原理

#### 2.1 [React 原理系列总结](https://zhuanlan.zhihu.com/p/18181370720)
