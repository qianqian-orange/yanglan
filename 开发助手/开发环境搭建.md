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

3. 查看 nvm 版本

   ```bash
   nvm -v
   ```

## 三. 安装 node

> 基于 chrome v8 引擎的 javascript 运行环境

1. 使用 nvm 安装制定 node 版本

   ```bash
   nvm install <version> # 例如 nvm install v22
   ```

2. 查看 node 版本

   ```bash
   node -v
   ```
