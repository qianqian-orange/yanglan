# Git

## 一. 工作区域

![git](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e8453878f8d140cd8f764d79ad59bc3b~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp?)

- 工作区
- 暂存区
- 本地仓库
- 远程仓库

## 二. 常用命令

### git init

初始化仓库

### git clone

克隆仓库

### git add

工作区提交暂存区

### git commit

暂存区提交本地仓库

```bash
# 将暂存区内容提交到本地仓库，提交信息为xxx
git commit -m "xxx"

# 将暂存区内容提交到本地仓库，并对上一次commit进行覆盖
git commit -m "xxx" --amend

# 将暂存区内容提交到本地仓库，并跳过commit信息填写
git commit --amend --no-edit
```

### git push

将本地仓库的内容推送到远程仓库

### git pull

拉取远程仓库并合并到本地仓库，相当于`git fetch + git merge`

```bash
# 关联本地分支与远程分支
git push --set-upstream origin xxx

# 使用rebase模式进行合并
git push --rebase
```

### git branch

删除分支、重命名分支

### git checkout

切换分支及撤销工作区内容的修改

```bash
# 切换本地分支xxx
git checkout xxx

# 切换到远程分支xxx
git checkout origin/xxx

# 本地新建xxx分支并切换
git checkout -b xxx
```

### git restore

将暂存区内容回退工作区

```bash
git restore --stage xxx
```

### git stash

缓存本地代码

```bash
# 将本地代码缓存起来
git stash

# 查看缓存记录
git stash list

# 取出上一次缓存代码并清除记录
git stash pop

# 取出上一次缓存代码但不清楚记录
git stash apply

# 删除某次缓存记录
git stash drop stash@{n}

# 清楚所有缓存
git stash clear
```

### git status

查看暂存区改动

### git log

查看 commit 日志

```bash
# 简要形式输出日志
git log --oneline
```

### git reset

回滚代码

```bash
# 回退某个commit版本并将改动内容放到暂存区（相当于取消commit操作，不取消add操作）
git reset --soft xxx

# 回退某个commit版本且不保留改动内容（相当于取消commit和add操作）
get reset --hard xxx
```

### git revert

取消某次 commit 内容，但不取消 commit 记录

### git rebase

合并多次 commit 和代码合并

```bash
# 合并前两次commit
git rebase -i HEAD~2

# 合并xxx分支
git rebase xxx
```

### git diff

对比差异
