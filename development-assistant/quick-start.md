# 开发环境搭建

## 一. 安装 git

> git 是代码版本管理工具

1. 访问[git 官网](https://git-scm.com/)
2. 下载安装对应系统版本
3. 打开终端查看 git 版本

   ```bash
   git --version
   ```

## 二. 安装 nvm

> nvm 是 node 版本管理工具

1. 打开终端克隆 nvm git 仓库

   ```bash
   git clone https://github.com/nvm-sh/nvm.git ~/.nvm
   ```

2. 进入 nvm 目录执行安装脚本

   ```bash
   cd ~/.nvm
   ./install.sh
   ```

3. 在用户目录下创建.zshrc文件，然后添加以下内容保存，最后执行source .zshrc命令

   ```bash
   export NVM_DIR="$HOME/.nvm"
   [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
   ```

4. 查看 nvm 版本

   ```bash
   nvm -v
   ```

## 三. 安装 node

> 基于 chrome v8 引擎的 javascript 运行环境

1. 使用 nvm 安装指定 node 版本

   ```bash
   nvm install <version> # 例如 nvm install v22
   ```

2. 查看 node 版本

   ```bash
   node -v
   ```

## 四. 安装mysql

4.1 下载mysql dmg格式安装包，地址: https://dev.mysql.com/downloads/mysql/

4.2 配置环境变量

```bash
# .zshrc
PATH=$PATH:/usr/local/mysql/bin
```

4.3 创建/etc/my.cnf配置文件

```bash
[mysqld]
mysql_native_password=ON
```

4.4 命令行连接数据库

```bash
ALTER USER 'root'@'localhost' IDENTIFIED WITH 'mysql_native_password' BY '12345678';
``
```

## 五. 安装redis

https://redis.io/docs/latest/operate/oss_and_stack/install/install-redis/install-redis-from-source/
