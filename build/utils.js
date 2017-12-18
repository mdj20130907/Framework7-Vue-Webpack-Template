var path = require('path')
var config = require('../config')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var glob = require('glob')
var HtmlWebpackPlugin = require('html-webpack-plugin')

exports.assetsPath = function (_path) {
  var assetsSubDirectory = process.env.NODE_ENV === 'production'
    ? config.build.assetsSubDirectory
    : config.dev.assetsSubDirectory
  return path.posix.join(assetsSubDirectory, _path)
}

exports.cssLoaders = function (options) {
  options = options || {}

  var cssLoader = {
    loader: 'css-loader',
    options: {
      minimize: process.env.NODE_ENV === 'production',
      sourceMap: options.sourceMap
    }
  }

  // generate loader string to be used with extract text plugin
  function generateLoaders (loader, loaderOptions) {
    var loaders = [cssLoader]
    if (loader) {
      loaders.push({
        loader: loader + '-loader',
        options: Object.assign({}, loaderOptions, {
          sourceMap: options.sourceMap
        })
      })
    }

    // Extract CSS when that option is specified
    // (which is the case during production build)
    if (options.extract) {
      return ExtractTextPlugin.extract({
        use: loaders,
        fallback: 'vue-style-loader'
      })
    } else {
      return ['vue-style-loader'].concat(loaders)
    }
  }

  // http://vuejs.github.io/vue-loader/en/configurations/extract-css.html
  return {
    css: generateLoaders(),
    postcss: generateLoaders(),
    less: generateLoaders('less'),
    sass: generateLoaders('sass', { indentedSyntax: true }),
    scss: generateLoaders('sass'),
    stylus: generateLoaders('stylus'),
    styl: generateLoaders('stylus')
  }
}

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = function (options) {
  var output = []
  var loaders = exports.cssLoaders(options)
  for (var extension in loaders) {
    var loader = loaders[extension]
    output.push({
      test: new RegExp('\\.' + extension + '$'),
      use: loader
    })
  }
  return output
}

exports.multiplePageHelper = function () {
  // 入口js文件
  var entries = {},
    // 调试环境，生成文件
    devPlugins = [],
    // 发布时，生成文件
    buildPlugins = []
  // 遍历: 处理windows换行符不一致的问题
  var viewDir = path.resolve(__dirname, '../src/view').replace(/\\/g, '/')
  glob.sync(path.resolve(viewDir, '**/main.js')).forEach(function (file) {
    var viewEntry = file.replace(viewDir, '').replace('/', '').replace('/main.js', '')
    var mainJs = './src/view/' + viewEntry + '/main.js'
    var indexHtml = viewEntry + '.html'
    // console.log(viewEntry, mainJs, indexHtml)
    entries[viewEntry] = mainJs
    var baseOptions = {
      filename: indexHtml,
      template: 'index.html',
      inject: true,
    }
    devPlugins.push(new HtmlWebpackPlugin({...baseOptions,
      chunks: [viewEntry],
    }))
    buildPlugins.push(new HtmlWebpackPlugin({...baseOptions,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      chunks: [viewEntry, 'manifest', 'vendor'],
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'dependency'
    }))
  })
  return {
    entries,
    devPlugins,
    buildPlugins
  }
}
