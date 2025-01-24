# HTTP

## 一. 什么是 HTTP

HTTP 是获取例如 HTML 文档资源的协议，是 Web 上进行任何数据交互的基础，同时，也是一种客户端-服务端协议。

## 二. HTTP 工作流程

- 建立 TCP 连接
- 发送请求报文

  - HTTP 方法
  - 请求路径
  - HTTP 协议版本号
  - HTTP 请求头
  - 请求体

- 读取响应报文

  - HTTP 协议版本号
  - 状态码
  - 状态信息
  - HTTP 响应头
  - 响应体

- 关闭 TCP 连接

## 三. 重定向

### `Location`响应头

- 临时重定向

  返回状态码 302，添加`Location`响应头指定重定向连接

- 永久重定向

  返回状态码 301，添加`Location`响应头指定重定向连接

### meta 标签

```html
<meta http-equiv="Refresh" context="0; URL=xxx" />
```

### window.location

```javascript
window.location = 'xxx'
```
