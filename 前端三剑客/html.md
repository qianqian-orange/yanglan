# HTML
## 一. 什么是HTML
HTML（HyperText Markup Language，超文本标记语言）是一种告知浏览器如何组织页面内容的标记语言。

## 二. HTML元素
1. 元素结构
    - 开始标签
    - 内容
    - 结束标签
  
2. 块级元素  
    - 块级元素单独占一行
    - 块级元素可以嵌套内联元素，但不能被内联元素嵌套

3. 内联元素
    - 内联元素不会占一行

4. 空元素
    - 只有一个标签，通常在此元素位置插入/嵌入一些东西，例如`<img />`

## 三. HTML属性
1. 属性结构
    - 属性名称 + 等号 + 属性值

2. 布尔属性
    - 没有属性值，例如`disabled`

## 四. HTML文档
```html
  <!DOCTYPE html>
  <html lang="zh-CN">
    <head>
      <meta charset="UTF-8" />
      <title>HTML</title>
    </head>
    <body>
      <p>hello world</p>
    </body>
  </html>
```
1. `<!DOCTYPE html>`: 声明文档类型

2. `<html></html`>: 根标签，包含页面所有内容
    - `lang`属性设置文档的主语言

3. `<head></head>`: 包含了HTML页面中不显示的内容，例如CSS样式，字符集声明，页面标题等等

4. `<meta />`: 代表元数据
    - 属性`name`指定了`meta`元素的类型；说明该元素包含了什么类型的信息
    - 属性`content`指定了实际的元数据内容

5. `<title></title>`: 设置页面标题

6. `<body></body>`: 包含HTML页面中显示的内容

## 五. 字符实体
在HTML中，字符`<`、`>`、`"`、`'`和`&`是特殊字符，如果想要文本展示，需要使用特殊编码

| 原义字符 | 字符引用 |
|----------|----------|
| <        | `&lt;`   |
| >        | `&gt;`   |
| "        | `&quot;` |
| '        | `&apos;` |
| &        | `&amp;`  |
| 空格      | `&nbsp;` | 

## 六. HTML注释
用于解释代码逻辑，不会在页面中展示，用法: `<!-- 注释内容 -->`

## 七. HTML标签
1. 标题: `h1`、`h2`、`h3`、`h4`、`h5`、`h6`

2. 列表
    - 有序: `ol`
    - 无序: `ul`
    - 列表项: `li`

3. 描述列表: `dl`、`dt`、`dd`

4. 强调: `strong`

5. 斜体: `em`

6. 下划线: `u`

7. 超链接: `a`
    - `href`: 指定链接
    - `title`: 添加信息，鼠标悬浮时会展示
    - `target`: 指定页面打开方式
    - `download`: 指定下载资源名称

8. 上标和下标: `sup`、`sub`

9. 段落: `p`

10. 图片: `img`

11. 视频: `video`

12. 音频: `audio`

## 八. 实际场景

### 站点添加自定义图标
```html
<link rel="icon" href="/favicon.ico" type="image/x-icon" />
```
> 备注: 如果站点采用了内容安全策略（Content Security Policy, CSP）来增加安全性，这个策略会应用到favicon图标上，如果遇到图标没有加载的问题，要检查是否被CSP的响应头`img-src`指令阻止访问

### 响应式图片
通过`img`标签的`srcset`和`sizes`属性控制或`picture`标签控制
- `srcset`定义了浏览器可选择的图片集合以及每个图片的大小，每个图片信息设置用逗号隔开

- `sizes`定义一组媒体条件

#### 1. 分辨率相同，可视窗口尺寸不同
```html
<img
  srcset="elva-fairy-480w.jpg 480w, elva-fairy-800w.jpg 800w"
  sizes="(max-width: 600px) 480px,
         800px"
  src="elva-fairy-800w.jpg"
/>
```

#### 2. 可视窗口尺寸相同，分辨率不同
`srcset`结合`x`描述符使用，不需要`sizes`
```html
<img
  srcset="elva-fairy-320w.jpg, elva-fairy-480w.jpg 1.5x, elva-fairy-640w.jpg 2x"
  src="elva-fairy-640w.jpg"
/>
```