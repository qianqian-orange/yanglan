# Cookie

## 一. 什么是 Cookie

`HTTP Cookie`是服务器发送给浏览器并保存在本地的一小块数据，在浏览器发起请求时会携带并发送给服务器。

## 二. 创建 Cookie

服务器在响应头添加`Set-Cookie`响应头

```http
Set-Cookie: <cookie-name>=<cookie-value>
```

## 三. Cookie 生命周期

- 会话 Cookie 会在当前会话结束后删除

- 持久化 Cookie 在过期时间指定一段时间后删除
  ```http
  Set-Cookie: name=jack; Expires=Wed, 21 Oct 2015 07:28:00 GMT;
  ```

## 四. Cookie 属性

### Expires

指定 cookie 过期时间

### Secure

标记为`Secure`的 Cookie 只能通过`HTTPS`协议传输

### HttpOnly

标记为`HttpOnly`的 Cookie 无法被 JavaScript 的`document.cookie`API 访问。可以有效预防 XSS 攻击

### Domain

`Domain`制定了哪些主机可以接受 Cookie，如果不指定，该属性默认为同一 host 设置 Cookie，不包含子域名。如果指定，则一般包含子域名

### Path

匹配 Path 的请求才会携带 Cookie

### SameSite

`SameSite`属性允许服务器指定是否通过跨站点携带 Cookie

- `Lax`: 默认值，允许部分第三方请求携带
- `Strict`: 仅当页面 URL 和请求 URL 一致时才携带
- `None`: 无论是否跨站都携带
