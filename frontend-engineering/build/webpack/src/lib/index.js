// 1. 获取配置文件
// 2. 解析入口依赖模块，获取依赖模块
// 3. 递归解析依赖模块，构建依赖图谱
// 4. 输出代码，注入require方法
// 5. require执行入口模块

const path = require('path')
const fs = require('fs')
const babel = require('@babel/parser')
const traverse = require('@babel/traverse').default
const { transformFromAstSync } = require('@babel/core')
const config = require(`${process.cwd()}/tinywebpack.config.js`)

// 项目路径
const rootPath = process.cwd()

// 获取文件相对路径
function relativePath(filePath) {
  return `./${path.relative(rootPath, filePath)}`
}

// 生成代码
function generate(entry, moduleGraph) {
  const template = `
    ;(function () {
      // 依赖模块
      const modules = {
        ${Object.keys(moduleGraph)
          .map(
            filePath => `'${moduleGraph[filePath].path}': function (require, module, exports) {
          ${moduleGraph[filePath].code}
        }`,
          )
          .join(',\n')}
      }

      // 模块缓存
      const cached = {}

      // 模块执行方法
      function require(moduleId) {
        if (cached[moduleId]) return cached[moduleId]
        const module = {
          exports: {},
        }
        cached[moduleId] = module
        const fn = modules[moduleId]
        // 执行模块代码逻辑
        fn(require, module, module.exports)
        return module.exports
      }
      
      require('${moduleGraph[entry].path}')
    })()
  `
  const { output } = config
  const exist = fs.existsSync(output.path)
  if (!exist) fs.mkdirSync(output.path)
  fs.writeFile(`${output.path}/${output.filename}`, template, err => {
    if (err) {
      console.log(err)
      return
    }
    console.log('success')
  })
}

// 解析依赖模块
function parse(moduleGraph, filePath) {
  // 如果依赖图谱中已存在说明已经解析过，不需要重复解析直接跳过即可
  if (moduleGraph[filePath]) return
  // 读取依赖模块文件内容
  const code = fs.readFileSync(filePath, { encoding: 'utf-8' })
  // 将代码转换成ast树
  const ast = babel.parse(code, { sourceType: 'module' })
  // 依赖模块
  const dependencies = []
  // 当前模块目录路径
  const dirname = path.dirname(filePath)
  // 遍历ast树，收集依赖模块
  traverse(ast, {
    ImportDeclaration(nodePath) {
      const { node } = nodePath
      const value = path.resolve(dirname, node.source.value)
      node.source.value = relativePath(value)
      dependencies.push(value)
    },
  })
  // 转换代码
  const result = transformFromAstSync(ast, code, {
    presets: ['@babel/preset-env'],
  })
  const dependency = {
    path: relativePath(filePath),
    code: result.code,
  }
  moduleGraph[filePath] = dependency
  // 递归依赖模块
  for (let i = 0; i < dependencies.length; i++) {
    parse(moduleGraph, dependencies[i])
  }
}

function bundle() {
  // 依赖模块图谱
  const moduleGraph = {}
  const { entry } = config
  // 解析入口依赖模块
  parse(moduleGraph, entry)
  // 生成代码
  generate(entry, moduleGraph)
}

bundle()
