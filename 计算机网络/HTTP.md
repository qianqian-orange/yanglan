# HTTP
## 一. HTTP概述
HTTP是获取例如HTML文档资源的协议，是Web上进行任何数据交互的基础，同时，也是一种客户端-服务端协议。

## 二. HTTP工作流程
- 建立TCP连接
- 发送请求报文
  - HTTP方法
  - 请求路径
  - HTTP协议版本号
  - HTTP请求头
  - 请求体

- 读取响应报文
  - HTTP协议版本号
  - 状态码
  - 状态信息
  - HTTP响应头
  - 响应体

- 关闭TCP连接

## 三. 重定向
### `Location`响应头
- 临时重定向
  
  返回状态码302，添加`Location`响应头指定重定向连接

- 永久重定向

  返回状态码301，添加`Location`响应头指定重定向连接

### meta标签
```html
<meta http-equiv="Refresh" context="0; URL=xxx" />
```

### window.location
```javascript
window.location = 'xxx'
```