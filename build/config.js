const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const notifier = require('node-notifier')
const _ = require('lodash')

const setting = require('./setting.js')
const { dev, build } = setting

var entry = setting.entries
var ExtractText = new ExtractTextPlugin('assets/style/[name].css?[contenthash]')
var CommonExtractText = new ExtractTextPlugin('assets/style/common.css?[contenthash]')

module.exports = (env, argv) => {
  var { production: prod } = env

  if (prod && build.vendor && build.vendor.length > 0) {
    entry.vendor = build.vendor
  }

  // hmr配置
  if (!prod && dev.hmr) {
    entry = _.mapValues(entry, (o) => {
      o.unshift('./build/client.js')
      return o
    })
  }

  var output = {
    filename: prod ? '[name].js?[chunkhash]' : '[name].js',
    path: rsv('../dist'),
    publicPath: prod ? build.publicPath : '/'
  }

  // css在打包的时候提炼公共文件
  var cssRules = prod ? [
    {
      test: /\.css$/,
      exclude: /common\.css/,
      use: ExtractText.extract({
        fallback: 'style-loader',
        use: {
          loader: 'css-loader',
          options: {
            minimize: true
          }
        }
      })
    },
    {
      test: /common\.css$/,
      use: CommonExtractText.extract({
        fallback: 'style-loader',
        use: {
          loader: 'css-loader',
          options: {
            minimize: true
          }
        }
      })
    }
  ] : [
    {
      test: /\.css$/,
      use: ['style-loader', 'css-loader']
    }
  ]

  var module = {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['env']
            }
          }
        ]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: prod ? '[path][name].[ext]?[hash]' : '[path][name].[ext]',
              context: rsv('../src')
            }
          }
        ]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: prod ? '[path][name].[ext]?[hash]' : '[path][name].[ext]',
              context: rsv('../src')
            }
          }
        ]
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
            options: {
              interpolate: true // 使得模板支持js语法插入
            }
          }
        ]
      }
    ].concat(cssRules)
  }

  var resolve = setting.resolve

  var devtool = prod ? (build.sourceMap ? 'source-map' : false) : 'cheap-module-source-map'

  var pages = _.map(prod ? build.pages : dev.pages, (o, k) => {
    // 默认page的filename为文件名，否则使用key作为文件名
    if (!o.filename) {
      o.filename = /\.html$/.test(k) ? k : (k + '.html')
    }

    return new HtmlWebpackPlugin(o)
  })

  var plugins = prod ? [
    new CleanWebpackPlugin(['dist'], {
      root: rsv('..')
    })
  ].concat(pages, [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor'
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'runtime'
    }),
    // 抽离css，并提炼公共css
    CommonExtractText,
    ExtractText,
    new webpack.optimize.ModuleConcatenationPlugin(),
    new UglifyJSPlugin({
      sourceMap: !!build.sourceMap
    })
  ]) : pages.concat([
    new FriendlyErrorsPlugin({
      compilationSuccessInfo: {
        messages: [`You application is running here http://localhost:${dev.port}`]
      },
      onErrors: (severity, errors) => {
        if (!dev.nativeNotifier) {
          return
        }
        
        if (severity !== 'error') {
          return
        }

        const error = errors[0]

        notifier.notify({
          title: 'Webpack error',
          message: severity + ': ' + error.name,
          subtitle: error.file || ''
        })
      }
    })
  ])

  // 添加hmr所需的plugin
  if (!prod && dev.hmr) {
    plugins.push(new webpack.HotModuleReplacementPlugin())
  }

  return {
    entry,
    output,
    module,
    resolve,
    devtool,
    plugins
  }
}

function rsv(pathName) {
  return path.resolve(__dirname, pathName)
}
