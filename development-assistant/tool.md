# 开发利器

## 1. vscode 插件

### 1.1 alias skip

支持别名路径跳转

```json
// vscode settings.json文件配置
{
  "alias-skip.mappings": {
    "@": "/src"
  }
}
```

### 1.2 ESlint

校验`js`代码

### 1.3 Stylelint

校验`css`代码

### 1.4 Prettier - Code formatter

格式化代码

1. 修改 vscode settings 配置

   ```javascript
   {
     "editor.defaultFormatter": "esbenp.prettier-vscode",
     "[javascript]": {
       "editor.defaultFormatter": "esbenp.prettier-vscode"
     },
     "[typescript]": {
       "editor.defaultFormatter": "esbenp.prettier-vscode"
     }
   }
   ```

2. 添加项目`.prettierrc.json`配置文件
   ```json
   {
     "semi": false,
     "singleQuote": true,
     "jsxSingleQuote": true,
     "trailingComma": "all",
     "endOfLine": "lf",
     "useTabs": false,
     "tabWidth": 2
   }
   ```

### 1.5 Tailwind CSS IntelliSense

Tailwind CSS提示插件

### 1.6 EditorConfig for VS Code

editor config

### 1.7 GitLens — Git supercharged

git插件

### 1.8 Database Client

数据库可视化

### 1.9 Bookmarks

书签

### 1.10 filesize

文件信息

## 2. [http-server](https://www.npmjs.com/package/http-server)

启动本地服务器

## 3. [whistle](https://www.npmjs.com/package/whistle)

抓包工具
