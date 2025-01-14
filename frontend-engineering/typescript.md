# TypeScript

## 一. tsconfig.json

### 1.1 include 和 exclude

```json
{
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### 1.2 module

指定模块化规范

```json
{
  "module": "esnext"
}
```

### 1.3 moduleResolution

可选值: `node`、`bundler`

- node

  同时支持ESM和CommonJs规范

- bundler

  支持`package.json`的`imports`和`exports`，允许文件不带扩展文件类型

### 1.4 noImplicitAny

禁用any

### 1.5 noEmit

不生成js代码文件、文件声明、source map

### 1.6 strict

严格类型检查，如空类型检查

### 1.7 typeRoots

指定typing类型文件目录

```json
{
  "typeRoots": ["typings", "node_modules/@types"]
}
```

### 1.8 esModuleInterop

磨平导入方式差异

```typescript
import * as fs from 'fs'
import _ from 'lodash'
fs.readFileSync('file.txt', 'utf8')
_.chunk(['a', 'b', 'c', 'd'], 2)

// 没有设置esModuleInterop，转成后的代码，这种情况依赖包导出数据结构，比如lodash_1通过default属性调用chunk方法，但是lodash不一定会导出default，那调用方式就可能有问题
;('use strict')
Object.defineProperty(exports, '__esModule', { value: true })
const fs = require('fs')
const lodash_1 = require('lodash')
fs.readFileSync('file.txt', 'utf8')
lodash_1.default.chunk(['a', 'b', 'c', 'd'], 2)

// 设置esModuleInterop，转成后的代码，通过tslib辅助检查依赖包导出数据结构，确保调用方式是没有问题的
;('use strict')
Object.defineProperty(exports, '__esModule', { value: true })
const tslib_1 = require('tslib')
const fs = tslib_1.__importStar(require('fs'))
const lodash_1 = tslib_1.__importDefault(require('lodash'))
fs.readFileSync('file.txt', 'utf8')
lodash_1.default.chunk(['a', 'b', 'c', 'd'], 2)
```

### 1.9 isolatedModules

declare const声明的类型编译后会被移除，如果代码中使用该类型，那运行时会报错，设置isolatedModules为true会在编辑阶段就报错提示

## 二. Narrowing

### 2.1 never

never可以赋值给任意类型，但不能将任意类型赋值给never

```typescript
let obj: never
```

### 2.2 as

断言

```typescript
obj as Person
```

### 2.3 !

强制判断不为null

```typescript
obj!.username
```

## 三. 类型操作符

### 3.1 generics

泛型

```typescript
function identity<Type>(args: Type): Type {
  return args
}
```

### 3.2 keyof

获取索引组合类型

```typescript
let obj = { name: 'zhansgan', age: 10 }

type ObjectType = keyof obj
// 等价于 type ObjectType = 'name' | 'age'
```

### 3.3 typeof

获取对象类型

```typescript
let obj = { name: 'zhangsan', age: 10 }

type ObjectType = keyof obj
// 等价于 type ObjectType = { name: string; age: number }
```

### 3.4 indexed access types

获取索引类型

```typescript
type Person = { name: string; age: number }
type Age = Person['age']
// 等价于 type Age = number
```

### 3.5 conditional types

条件判断类型

```typescript
interface Animal {}
interface Dog {}

type Example = Dog extends Animal ? number : string
```

### 3.6 mapped types

映射类型

```typescript
type OptionsFlags<Type> = {
  [Property in keyof Type]: boolean
}

type Features = {
  darkMode: () => void
  newUserProfile: () => void
}

type FeatureOptions = OptionsFlags<Features>
// 等价于 type FeatureOptions = { darkMode: boolean; newUserProfile: boolean }
```

## 四. Utility Types

### 4.1 `Awaited<Type>`

获取Promise返回值类型

```typescript
type A = Awaited<Promise<number>>
// 等价于 type A = number
```

### 4.2 `Partial<Type>`

将Type类型属性变成可选值

```typescript
interface Person {
  name: string
  age: number
}

type PartialPerson = Partial<Person>
// 等价于 type PartialPerson = { name?: string; age?: number }
```

### 4.3 `Required<Type>`

将Type类型属性变成必选

```typescript
interface Person {
  name?: string
  age?: number
}

type RequiredPerson = Required<Person>
// 等价于 type RequiredPerson = { name: string; age: number }
```

### 4.4 `Readonly<Type>`

将Type类型属性变成只读

```typescript
interface Person {
  name: string
  age: number
}

const person: Readonly<Person> = {
  name: 'zhangsan',
  age: 10
}
```

### 4.5 `Pick<Type, Keys>`

获取Type类型keys组合类型

```typescript
interface Person {
  name: string
  age: number
}

type PickPerson = Pick<Person, 'name'>
// 等价于 type PickPerson = { name: string }
```

### 4.5 `Omit<Type, Keys>`

去除Type类型keys属性

```typescript
interface Person {
  name: string
  age: number
}

type OmitPerson = Omit<Person, 'age'>
// 等价于 type OmitPerson = { name: string }
```

### 4.6 `Exclude<UnionType, ExcludedMembers>`

去除联合类型的成员

```typescript
type T0 = Exclude<'a' | 'b' | 'c', 'a'>
// 等价于 type T0 = 'b' | 'c'
```

### 4.7 `Extract<Type, Union>`

获取Type和Union公有类型

```typescript
type T0 = Extract<'a' | 'b', 'a'>
// 等价于 type T0 = 'a'
```

### 4.8 `NonNullable<Type>`

去除null和undefined类型

```typescript
type T0 = NonNullable<number | null | undefined>
// 等价于 type T0 = number
```

### 4.9 `ReturnType<Type>`

获取Type类型返回值类型

```typescript
type T0 = ReturnType<() => string>
// 等价于 type T0 = string
```
