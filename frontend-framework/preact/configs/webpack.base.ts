const path = require('path')
import webpack from 'webpack'
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const ESlintWebpackPlugin = require('eslint-webpack-plugin')
const StylelintWebpackPlugin = require('stylelint-webpack-plugin')

const resolvePath = (...paths: string[]) => path.join(__dirname, ...paths)

const isDev = process.env.NODE_ENV === 'development'

const config: webpack.Configuration = {
  entry: resolvePath('../src/index'),
  output: {
    filename: isDev ? '[name].js' : '[name].[contenthash:6].js',
    path: resolvePath('../dist'),
    publicPath: '/',
    clean: {
      keep: /dll/,
    },
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: {
                auto: true,
                exportGlobals: true,
                localIdentName: '[local]--[hash:base64]',
              },
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: ['postcss-preset-env'],
              },
            },
          },
        ],
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024, // 8kb
          },
        },
        generator: {
          publicPath: 'static/images/',
          outputPath: 'static/images',
          filename: '[name].[contenthash:6][ext][query]',
        },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.jsx?$/i,
        include: resolvePath('../src'),
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              plugins: [
                '@babel/plugin-transform-runtime',
                [
                  '@babel/plugin-transform-react-jsx',
                  { pragma: 'h', pragmaFrag: 'Fragment' },
                ],
              ],
            },
          },
          {
            loader: 'imports-loader',
            options: {
              imports: ['named preact h'],
            },
          },
        ],
      },
      {
        test: /\.tsx?$/i,
        include: resolvePath('../src'),
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: resolvePath('../public/index.html'),
    }),
    new ForkTsCheckerWebpackPlugin(),
    new ESlintWebpackPlugin({
      configType: 'flat',
      extensions: ['js', 'ts', 'jsx', 'tsx'],
    }),
    new StylelintWebpackPlugin(),
  ],
  resolve: {
    alias: {
      '@': resolvePath('../src'),
      preact: resolvePath('../src/libs'),
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx'],
    modules: [resolvePath('../src'), resolvePath('../node_modules')],
  },
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
      // cacheGroups: {
      //   vendor: {
      //     test: /node_modules/,
      //     name: 'vendors',
      //     chunks: 'all',
      //   },
      // },
    },
  },
  stats: 'normal',
}

module.exports = config
