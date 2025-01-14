# 响应式布局

## 一. viewport

### 1.1 layout viewport

大于实际屏幕宽度，用于网站外观和桌面浏览器的一样。

### 1.2 visual viewport

当前显示在屏幕上页面，即浏览器可视区域的宽度。

### 1.3 ideal viewport

为浏览器定义的可完美适配移动端的 viewport，固定不变，可以认为是设备视口宽度。

## 二. 物理像素

屏幕渲染图像的最小单位

## 三. 设备独立像素

逻辑像素，对应 css 像素

## 四. 设备像素比

dpr = 物理像素 / 设备独立像素

## 五. meta 标签

| 属性          | 说明                        |
| ------------- | --------------------------- |
| width         | 设置`layout viewport`的宽度 |
| height        | 设置`layout viewport`的高度 |
| initial-scale | 页面初始缩放比例            |
| maximum-scale | 用户缩放最大值              |
| minimum-scale | 用户缩放最小值              |
| user-scalable | 允许用户缩放                |

## 六. `rem`方案

- 第一步设置`meta`

  ```html
  <meta
    name="viewport"
    content="width=device-width;initial-scale=1.0"
  />
  ```

- 第二步设置`html`标签`font-size`

  ```js
  ;(() => {
    const docEl = document.documentElement
    const psdWidth = 750
    const fontSize = 75
    let meta = document.querySelector('meta[name="viewport"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'viewport')
      document.head.appendChild(meta)
    }

    function setRemUnit() {
      const dpr = window.devicePixelRatio || 1
      const scale = 1 / dpr
      meta.setAttribute(
        'context',
        `width=device-width, initial-scale=${scale}, user-scalable=no`
      )
      const width = docEl.clientWidth
      docEl.style.fontSize = width / (psdWidth / fontSize) + 'px'
    }

    setRemUnit()

    window.addEventListener('resize', setRemUnit)
  })()
  ```

- 第三步封装函数

  ```css
  @function px2rem($px) {
    @return $px / $baseFontSize * 1rem;
  }
  ```
