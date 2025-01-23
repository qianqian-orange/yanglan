# 二叉树

## 一. 二叉树种类

### 1.1 满二叉树

### 1.2 完全二叉树

### 1.3 二叉搜索树

## 二. 构建二叉树

### 2.1 根据前序遍历和中序遍历构建二叉树

```javascript
function TreeNode(val) {
  this.val = val
  this.left = null
  this.right = null
}

function buildTree(preorder, inorder) {
  function build(
    preorder,
    preorderStart,
    preorderEnd,
    inorder,
    inorderStart,
    inorderEnd
  ) {
    if (preorderStart > preorderEnd || inorderStart > inorderEnd)
      return null
    const val = preorder[preorderStart]
    const root = new TreeNode(val)
    const index = inorder.findIndex(v => v === val)
    const leftLen = index - inorderStart
    root.left = build(
      preorder,
      preorderStart + 1,
      preorderStart + leftLen,
      inorder,
      inorderStart,
      index - 1
    )
    root.right = build(
      preorder,
      preorderStart + leftLen + 1,
      preorderEnd,
      inorder,
      index + 1,
      inorderEnd
    )
    return root
  }
  return build(
    preorder,
    0,
    preorder.length - 1,
    inorder,
    0,
    inorder.length - 1
  )
}
```

### 2.2 根据后序遍历和中序遍历构建二叉树

```javascript
function TreeNode(val) {
  this.val = val
  this.left = null
  this.right = null
}

function buildTree(inorder, postorder) {
  function build(
    inorder,
    inorderStart,
    inorderEnd,
    postorder,
    postorderStart,
    postorderEnd
  ) {
    if (inorderStart > inorderEnd || postorderStart > postorderEnd)
      return null
    const val = postorder[postorderEnd]
    const root = new TreeNode(val)
    const index = inorder.findIndex(v => v === val)
    const leftLen = index - inorderStart
    root.left = build(
      inorder,
      inorderStart,
      index - 1,
      postorder,
      postorderStart,
      postorderStart + leftLen - 1
    )
    root.right = build(
      inorder,
      index + 1,
      inorderEnd,
      postorder,
      postorderStart + leftLen,
      postorderEnd - 1
    )
    return root
  }
  return build(
    inorder,
    0,
    inorder.length - 1,
    postorder,
    0,
    postorder.length - 1
  )
}
```
