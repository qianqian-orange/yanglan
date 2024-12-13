# MIME类型
## 一. 概念
媒体类型是一种标准，用来表示文档、文件和一组数据的性质和格式。

## 二. 常用类型
| 类型 | 说明 |
| ----- | ----- |
| `application/octet-stream` | 二进制文件默认值，意味着未知的二进制文件，浏览器一般不会执行 |
| `text/plain` | 文本文件默认值，意味着未知的文本文件，浏览器直接展示 |
| `text/css` | css文件默认值 |
| `text/html` | html文件默认值 |
| `text/javascript` | javascript文件默认值 |
| `image/png`、`image/jpeg`、`image/gif` | 图片类型 |
| `multipart/form-data` | 表单数据 |
| `multipart/byteranges` | 指定文件由若干部分组成，每一个部分都有请求范围 |
| `application/json` | json数据 |