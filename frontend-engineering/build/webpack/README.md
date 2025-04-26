# webpack

## 一. 什么是 Webpack

webpack 是 JS 模块打包器

## 二. 插件

### 插件原型方法

```javascript
class MyPlugin {
  apply(compiler) {
    ...
  }
}
```

### 常用插件

| plugin                       | 说明              |
| ---------------------------- | ----------------- |
| html-webpack-plugin          | 生成 html         |
| mini-css-extract-plugin      | 生成 css          |
| webpack-merge                | 合并 webpack 配置 |
| webpack-bundle-analyzer      | 分析 bundle       |
| css-minimizer-webpack-plugin | 压缩 css 代码     |
| eslint-webpack-plugin        | eslint 校验       |
| stylelint-webpack-plugin     | css 校验          |

## 三. loader

### loader 原型方法

```javascript
function loader(content) {
  return content
}
```

### 常用 loader

| loader         | 说明            |
| -------------- | --------------- |
| style-loader   | 创建 style 标签 |
| css-loader     | 解析 css 样式   |
| postcss-loader | 解析 postcss    |
| babel-loader   | 转换 js 代码    |

## 四. webpack 配置文件

### webpack.base.ts

```javascript
const path = require("path");
import webpack from "webpack";
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ESlintWebpackPlugin = require("eslint-webpack-plugin");
const StylelintWebpackPlugin = require("stylelint-webpack-plugin");

const resolvePath = (...paths: string[]) => path.join(__dirname, ...paths);

const isDev = process.env.NODE_ENV === "development";

const config: webpack.Configuration = {
  // 指定入口文件
  entry: resolvePath("./src/index.js"),
  // 指定输出文件
  output: {
    filename: isDev ? "[name].js" : "[name].[contenthash:6].js", // 文件名
    path: resolvePath("./dist"), // 文件目录
    publicPath: "/",
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: resolvePath("./public/index.js"),
    }),
    new ForkTsCheckerWebpackPlugin(),
    new ESlintWebpackPlugin({
      configType: "flat",
      extensions: ["js", "ts", "jsx", "tsx"],
    }),
    new StylelintWebpackPlugin(),
  ],
  module: {
    rules: [
      // 解析css
      {
        test: /\.css$/i,
        use: [
          isDev ? "style-loader" : MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              modules: {
                exportGlobals: true,
                localIdentName: "[local]--[hash:base64]",
              },
            },
          },
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: ["postcss-preset-env"],
              },
            },
          },
        ],
      },
      // 解析图片
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        type: "asset",
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024, // 8kb
          },
        },
        generator: {
          publicPath: "static/images/",
          outputPath: "static/images",
          filename: "[name].[contenthash:6][ext][query]",
        },
      },
      // 解析字体
      {
        test: /\.(woff|woff2|eot|ttf|otf)/i,
        type: "asset/resource",
      },
      // 解析js
      {
        test: /\.jsx?$/i,
        include: resolvePath("./src"),
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
              plugins: ["@babel/plugin-transform-runtime"],
            },
          },
        ],
      },
      // 解析ts
      {
        test: /\.tsx?$/i,
        include: resolvePath("./src"),
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
            },
          },
        ],
      },
    ],
  },
  resolve: {
    alias: {
      "@": resolvePath("./src"),
    },
    extensions: [".js", ".ts", "jsx", ".tsx"],
    modules: [resolvePath("./src"), resolvePath("./node_modules")],
  },
  optimization: {
    runtimeChunk: "single",
    splitChunks: {
      chunks: "all",
    },
  },
  stats: "normal",
};

module.exports = config;
```

### webpack.dev.js

```javascript
const path = require("path");
import webpack from "webpack";
import { Configuration } from "webpack-dev-server/types/lib/Server";
const { merge } = require("webpack-merge");
const baseConfig = require("./webpack.base");

const resolvePath = (...paths: string[]) => path.join(__dirname, ...paths);

const config: webpack.Configuration & Configuration = {
  mode: "development",
  devtool: "eval-cheap-module-source-map",
  devServer: {
    static: resolvePath("./dist"),
    open: true,
  },
};

module.exports = merge(baseConfig, config);
```

### webpack.prod.js

```javascript
const path = require("path");
import webpack from "webpack";
const { merge } = require("webpack-merge");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerWebpackPlugin = require("css-minimizer-webpack-plugin");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const baseConfig = require("./webpack.base");

const resolvePath = (...paths: string[]) => path.join(__dirname, ...paths);

const config: webpack.Configuration = {
  mode: "production",
  devtool: "source-map",
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].[contenthash:6].css",
    }),
    new BundleAnalyzerPlugin(),
  ],
  optimization: {
    minimizer: ["...", new CssMinimizerWebpackPlugin()],
  },
};

module.exports = merge(baseConfig, config);
```

## 五. webpack 性能优化

### 代码分割

#### dependOn

```javascript
module.exports = {
  entry: {
    main: {
      import: './src/index.js',
      dependOn: 'shared',
    },
    shared: 'lodash',
  },
}
```

#### SplitChunkPlugin

```javascript
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
}
```

#### Dynamic Imports

```javascript
import('lodash').then(({ default: _ }) => {
  _.get(obj, 'name')
})
```

### prefetching/preloading modules

### Bundle Analysis

```javascript
const BundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = {
  plugins: [new BundleAnalyzerPlugin()],
}
```

### Tree Shaking

### 图片压缩

使用`image-minimizer-webpack-plugin`插件

## 六. Build Performance

### 6.1 thread-loader

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src'),
        use: ['thread-loader', 'babel-loader'],
      },
    ],
  },
}
```

### 6.2 Resolving

```javascript
module.exports = {
  resolve: {
    modules: [
      path.resolve(__dirname, 'src'),
      path.resolve(__dirname, 'node_modules'),
    ],
    extensions: ['.js'],
  },
}
```

### 6.3 DllPlugin

#### DllPlugin

```javascript
module.exports = {
  mode: 'production',
  entry: {
    vendors: ['react', 'react-dom'],
  },
  output: {
    filename: '[name].[contenthash:6].dll.js',
    path: path.resolve(__dirname, '../dist/dll'),
    library: '[name]_[fullhash]',
  },
  plugins: [
    new webpack.DllPlugin({
      path: path.resolve(__dirname, '../dist/dll/manifest.json'),
      name: '[name]_[fullhash]',
    }),
  ],
}
```

#### DllReferencePlugin

```javascript
module.exports = {
  plugins: [
    new webpack.DllReferencePlugin({
      manifest: path.resolve(__dirname, './dist/dll/manifest.json'),
    }),
  ],
}
```

## 七. 实际场景

### 开发 library

```javascript
module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'libraryname.js',
    path: path.resolve(__dirname, 'dist'),
    globalObject: 'this',
    library: {
      name: 'libraryname',
      type: 'umd', // 支持amd, commonjs, script tag
    },
  },
  // 通过外链引入
  externals: {
    lodash: {
      commonjs: 'lodash',
      commonjs2: 'lodash',
      amd: 'lodash',
      root: '_',
    },
  },
}
```

## 八. 原理

1. [深入理解 tapable 原理](https://juejin.cn/post/7448525006260781082)
2. [深入理解 webpack build 原理](https://juejin.cn/spost/7450479518710054966)
3. [深入理解 webpack 热更新原理](https://juejin.cn/post/7452321092674453531)
