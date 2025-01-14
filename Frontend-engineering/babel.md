# babel

## 一. 什么是 babel

babel 是一个 JavaScript 编译器。

## 二. 插件和预设

### 插件执行顺序

- 预设指定的插件执行顺序跟预设书写顺序是相反的
- plugins 指定的插件会优先执行，再执行预设指定的插件

### 插件钩子函数

- pre

  在执行`visitor`事件函数之前执行

- post

  在执行`visitor`事件函数之后执行

- parserOverride

  自定义解析`ast`树逻辑

- generatorOverride

  自定义生成代码逻辑

### 预设方法原型

```javascript
;async (api, options, dirname) => {
  const plugins = [[() => {}, {}]]
  return {
    plugins
  }
}
```

### 插件方法原型

```javascript
;async (api, options, dirname) => {
  return {
    visitor
  }
}
```

## 三. babel 配置

- code

  默认值为`true`，指定是否生成代码

- ast

  默认值为`false`，指定是否返回`ast`树

- targets

  指定支持的浏览器版本

  ```javascript
  {
    "target": "> 0.25%, not dead"
  }
  ```

## 四. 原理

### 动态加载模块

使用`nodejs`的`module`模块实现

```
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
// 加载xxx模块
const module = require(xxx)
```

### babel 编译原理

[深入理解 Babel 编译原理](https://juejin.cn/post/7447712058198081546)
