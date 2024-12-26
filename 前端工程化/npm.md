# npm
## 一. 什么是npm
npm是JavaScript包管理工具，包含三个部分即网站、npm CLI和npm源

## 二. npm进化史
### 嵌套结构
在早期的npm版本采用嵌套结构的方式安装依赖，优点是逻辑简单，但是存在一些问题
  - 重复安装
  - 嵌套层级过深

例如项目依赖A和C，这两个依赖都依赖了B，那么会导致安装两次B
```bash
root -> A - B
     -> C - B
```

![嵌套结构](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cd0cd80f11f3453bb771584e149c786e~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

### 扁平化
将公共模块提升到顶级依赖。

还是上面的示例，那么采用扁平化方式安装依赖

![扁平化](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f6599ca8c7d3454fa8e1c8e264185ac3~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

问题:
  - 幽灵依赖

    由于扁平化安装，导致B模块被提升到顶级依赖，那么按照node依赖查找机制，我们是可以直接引用B模块的，但是package.json文件并没有写明依赖B模块。这样当B模块有一些`break change`时，那么可能导致代码出现问题
  
  - 依赖分身

    当子依赖版本不同时，只能提升其中一个依赖版本，另一个依赖版本还是安装到子目录中，那么没有提升的依赖版本还是会出现重复安装的情况


  - 依赖不幂等

    根据安装顺序不同，安装的依赖结构可能不同。通过`package-lock.json`文件解决此问题。

## 三. npm cli
### npm config
获取、修改、删除配置

```bash
npm config list
npm config set key=value
npm config delete key
```

### npm init
创建package.json文件

### npm install
安装依赖

- 本地依赖

  依赖会安装在项目目录的`.node_modules`下，可执行命令会安装在`.node_modules/.bin`

- 全局依赖

  依赖会安装在`$npm_config_prefix/lib/node_modules`下，可执行命令会安装在`$npm_config_prefix/bin`

### npm cache
用于添加、删除、校验缓存依赖

```bash
npm cache add <package>
npm cache clean [<key>]
npm cache verify
```

### npm ls
查看依赖树

### npm link
软链一个npm包

```bash
# 假如我们要调试本地的npm包
# 第一步进入npm包目录执行npm link，将npm包注册到全局模块中，即$npm_config_prefix/lib/node_modules目录中
npm link

# 第二步进入项目目录，执行npm link <package>，将npm包软链到项目目录的node_modules中
npm link <package>

# 第三步调试完成后要执行npm unlink <package>，将npm包移除
npm unlink <package>
```

### npm update
更新依赖版本

### npm publish
推送npm包

### npx
执行远程依赖指令

```bash
npx create-react-app helloworld
```

### npm profile
获取npm账号信息

## 四. package.json配置
### dependencies
生产环境依赖

### devDependencies
开发环境依赖

### peerDependencies
指定关联依赖版本

```json
{
  "peerDependencies": {
    "axios": "1.0.0"
  }
}
```
### peerDependenciesMeta
指定关联依赖版本是否安装

```json
{
  "peerDependencies": {
    "axios": "1.0.0"
  },
  "peerDependenciesMeta": {
    "axios": {
      "optional": true
    }
  }
}
```

### optionalDependencies
当依赖安装失败或者找不到依赖时不影响npm运行

```json
{
  "optionalDependencies": {
    "axios": "1.0.0"
  }
}
```

### bundleDependencies
指定一个依赖数组，发包的时候一起打包

```json
{
  "bundleDependencies": ["axios"]
}
```

### main
指定依赖入口执行文件

```json
{
  "main": "index.js"
}
```

### scripts
指定可执行的脚本命令

```json
{
  "scripts": {
    "dev": "node index.js"
  }
}
```

### overrides
锁定依赖版本

```json
{
  "overrides": {
    "axios": "1.0.0"
  }
}
```

### workspaces
将`workspaces`匹配的目录软链到`node_modules`中

```json
{
  "workspaces": ["./packages/*"]
}
```

### engines
配置环境依赖版本

```json
{
  "engines": {
    "node": ">=1.0.0"
  }
}
```

## 五. 实际场景
### .npmrc文件
在项目中添加`.npmrc`文件，用于设置npm配置，例如指定`registry`

### 发布npm包
> 需要注意`registry`是否是`https://registry.npmjs.org`，如果不是可以通过`.npmrc`文件配置指定或执行命令时添加`--registry`参数指定

- 注册npm平台账号并登录
- 本地登录npm平台账号
  ```bash
  npm login
  ```

- 新建项目
- 初始化`package.json`
- 添加`publishConfig`配置
  ```json
  {
    "publishConfig": {
      "access": "publish"
    }
  }
  ```

- 发布版本
  ```bash
  npm publish
  ```
  
- 更新版本
  ```bash
  npm version major | minor | patch
  ```

## 六. 原理
- [深入理解npm install原理](https://juejin.cn/post/7446363362068086838)