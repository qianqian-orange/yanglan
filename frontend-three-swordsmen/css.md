# CSS

## 一. 什么是 CSS

`CSS`（`Cascading Style Sheets`，层叠样式表）是一门样式表语言，为`HTML`元素添加样式。

## 二. CSS 用法

1. 外部样式表

   外部样式表在一个单独的扩展名为`.css`的文件中，通过`link`标签进行引用

2. 内部样式表

   内部样式表在 HTML 文档的`style`标签中

3. 内联样式

   内联样式是在元素标签的`style`属性中

## 三. CSS 选择器

| 选择器名称            | 选择的内容                                   |
| --------------------- | -------------------------------------------- |
| 类型选择器/标签选择器 | 所定义类型的 HTML 元素                       |
| ID 选择器             | 具有特定 ID 的元素                           |
| 全局选择器            | 由星号(\*)指代所选中的所有内容               |
| 类选择器              | 具有特定类的元素                             |
| 属性选择器            | 具有特定属性的元素                           |
| 伪类选择器            | 特定状态的元素，例如`:hover`、`:first-child` |
| 伪元素选择器          | `::after`、`::before`、`::first-line`        |
| 后代选择器            | 用空格组合两个选择器                         |
| 子代选择器            | 用大于号>组合两个选择器，只选中第一代子元素  |
| 相邻兄弟选择器        | 用加号+组合两个选择器                        |
| 通用兄弟关系选择器    | 用波浪号~组合两个选择器                      |

## 四. 优先级

一个选择器的优先级有三位不同的值相加，即百（ID 选择器） + 十（类选择器/属性选择器/伪类选择器） + 个（元素选择器/伪元素选择器）。

评估优先级的最佳方法是对不同的优先级等级单独进行评分，并从最高的等级开始，如果优先级相同则再比较下一级，否则直接忽略低等级的选择器，因为它们无法覆盖高优先级等级的选择器。

此外需要注意的是`!import`的权重最高，其次是内联样式，再者才是选择器优先级。

## 五. 盒模型

1. 组成部分

   - `content`: 内容区域
   - `padding`: 内边距
   - `border`: 边框
   - `margin`: 外边距

2. 外边距折叠

   - 两个相邻的外边距都是正数时，折叠结果是它们两者之间较大的值。
   - 两个相邻的外边距都是负数时，折叠结果是它们绝对值的较大值。
   - 两个外边距一正一负时，折叠结果是两者的相加的和。

## 六. CSS 单位

| 单位 | 说明                         |
| ---- | ---------------------------- |
| px   | 像素                         |
| rem  | 相对于根标签`html`的字体大小 |
| em   | 相对于父标签的字体大小       |
| vw   | 相对于可视窗口宽度大小       |
| vh   | 相对于可视窗口高度大小       |

## 七. CSS 布局

1. 常规流瀑布

   默认情况下，块级元素会填充其父元素所在的行向空间，每个块级元素都会在上一个元素下面另起一行。

   行级元素不会另起一行，空间不够时，溢出的内容会下移到新的一行。

2. 弹性布局

   设置`display`为`flex`将父容器变成`flex`布局

   - `flex-direction`: 指定主轴方向

     - 默认值是`row`: 主轴水平方向
     - `column`: 主轴垂直方向

   - `justify-content`: 控制子项在主轴上的位置

     - 默认值是`flex-start`: 所有子项处于主轴的开始处
     - `flex-end`: 所有子项处于主轴的末尾处
     - `center`: 所有子项主轴居中
     - `space-around`: 在主轴上均匀分布，任意一端都会留有空间
     - `space-between`: 在主轴上均匀分布，主轴首位两端不留空间

   - `align-items`: 控制子项在交叉轴上的位置

     - 默认值是`stretch`: 所有子项沿着交叉轴的方向延伸以填充父容器
     - `center`: 所有子项交叉轴居中
     - `flex-start`: 所有子项处于交叉轴开始处
     - `flex-end`: 所有子项处于交叉轴末尾处

   - `flex-wrap`: 控制子项是否换行

     - 默认值是`nowrap`: 不换行
     - `wrap`: 换行

   - `flex-grow`

   - `flex-shrink`

   - `flex-basic`

3. 浮动

   浮动元素会脱离正常文档流，并吸附到其父容器的左边，在正常布局中位于该浮动元素下的内容，此时会围绕浮动元素，填充其右侧的空间。

   如何清除浮动

   - 添加`clear`样式，例如`clear`: `left`
   - 添加`overflow`样式，例如`overflow`: `auto`
   - 设置`display`为`flow-root`

4. 定位

   - 静态定位和相对定位不会脱离正常文档流
   - 固定定位相对于浏览器视口进行定位
   - 绝对定位的相对定位取决于父元素的`position`，默认情况下`position`的值为`static`，则相对于浏览器视口进行定位

## 八. BFC

`BFC`(`Block Formatting Context`，区块格式化上下文)是 Web 页面 CSS 渲染的一部分，是块级盒子布局过程发生的区域，也是浮动元素与其他元素交互的区域。

以下方式会创建 BFC

- 文档的根标签`html`
- 浮动元素（`float`不为`none`的元素）
- 绝对定位元素（`position`为`fixed`或`absolute`的元素）
- 行内块元素（`display`为`inline-block`的元素）
- 表格单元格（`display`为`table-cell`）
- 表格标题（`display`为`table-caption`）
- `display`为`flow-root`的元素
- `overflow`不为`visible`或`clip`的元素
- 弹性元素
- 网格元素
- 多列容器

作用

- 防止外边距折叠
- 清除浮动

## 九. CSS 属性

- `white-space`

  控制空白字符的显示

  - `normal`: 不保留换行符和空格，可以自动换行
  - `nowrap`: 不保留换行符和空格，不能自动换行
  - `pre`: 保留换行符和空格，不能自动换行
  - `pre-wrap`: 保留换行符和空格，可以自动换行
  - `pre-line`: 保留换行符，不保留空格，可以自动换行

- `word-break`

  控制单词如何拆分换行

  - `normal`: 默认值
  - `keep-all`: 单词触碰边界一律不换行
  - `break-all`: 单词触碰边界一律拆分换行

- `word-wrap`

  控制超过一行的单词是否换行

  - `normal`: 默认值
  - `break-word`: 换行

## 十. BEM 规范

`BEM`即块级元素修饰符（`Block Element Modifier`）。在`BEM`中，一个块，例如一个按钮、菜单或标志，就是独立的实体。一个元素就像一个列表项或标题一样，被绑定到它所在的块。修饰符是标记到一个块或元素的标示，能够改变样式或者行为。

```css
.button__icon {
}
.button--primary {
}
```

## 十一. 实际场景

### 11.1 多行文本省略

```css
.box {
  width: 100px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3; /* 指定行数 */
}
```

### 11.2 元素水平垂直居中

1. 绝对定位 + `margin`

   ```css
   .box {
     width: 100px;
     height: 100px;
     background-color: red;
     position: absolute;
     top: 0;
     right: 0;
     bottom: 0;
     left: 0;
     margin: auto;
   }
   ```

2. 绝对定位 + `transform`

   ```css
   .box {
     width: 100px;
     height: 100px;
     background-color: red;
     position: absolute;
     top: 50%;
     left: 50%;
     transform: translate(-50%, -50%);
   }
   ```

3. `flex`布局

   ```css
   .box {
     display: flex;
     justify-content: center;
     align-items: center;
   }
   ```

### 11.3 圣杯布局

左右固定，中间宽度自适应

通用样式

```css
.container {
  position: relative;
  width: 100%;
  height: 100px;
}

.container div {
  height: 100%;
}

.left,
.right {
  width: 200px;
}

.left {
  background-color: red;
}

.right {
  background-color: blue;
}

.middle {
  background-color: green;
}
```

通用结构

```html
<div class="container">
  <div class="left"></div>
  <div class="right"></div>
  <!-- 注意中间元素要放在最后位置 -->
  <div class="middle"></div>
</div>
```

1. 绝对定位 + `float`

   ```css
   .left {
     float: left;
   }

   .right {
     float: right;
   }

   .middle {
     position: absolute;
     left: 200px;
     right: 200px;
   }
   ```

2. 绝对定位 + `margin`

   ```css
   .left,
   .right {
     position: absolute;
     top: 0;
   }

   .left {
     left: 0;
   }

   .right {
     right: 0;
   }

   .middle {
     margin-left: 200px;
     margin-right: 200px;
   }
   ```

3. `overflow` + `float`

   ```css
   .left {
     float: left;
   }

   .right {
     float: right;
   }

   .middle {
     overflow: auto;
   }
   ```

4. `margin` + `float`

   ```css
   .left {
     float: left;
   }

   .right: {
     float: right;
   }

   .middle {
     margin-left: 200px;
     margin-right: 200px;
   }
   ```

5. `padding` + `float`

   ```css
   .left {
     float: left;
   }

   .right {
     float: right;
   }

   .middle {
     padding-left: 200px;
     padding-right: 200px;
   }
   ```

6. `flex`

   ```css
   .container {
     display: flex;
   }

   .middle {
     flex: 1;
   }
   ```

### 11.4 半透明边框

```html
<div class="container"></div>
```

```css
.container {
  width: 100px;
  height: 100px;
  background-color: red;
  border: 10px solid hsla(0, 0%, 100%, 0.5);
  background-clip: padding-box;
}
```

### 11.5 毛玻璃

```html
<div class="container">
  <div class="content"></div>
</div>
```

```css
.container {
  position: relative;
  width: 100px;
  height: 100px;
}

.container::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-image: url('xxx');
  background-position: center;
  background-size: cover;
  background-attachment: fixed;
  filter: blur(10px);
}

.content {
  position: relative;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.5);
}
```
