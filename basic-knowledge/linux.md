# linux

## 硬连接

```bash
ln [源文件/目录] [目标文件/目录]

# 为a创建一个硬连接b
ln a b
```

## 软连接

```bash
ln -s [源文件/目录] [目标文件/目录]

# 为a创建一个软连接b
ln -s a b
```

## 查找文件

```bash
find . -name "xxx"
```
