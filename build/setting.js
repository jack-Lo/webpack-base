var path = require('path')
var url = require('url')

module.exports = {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
      '@a': path.resolve(__dirname, '../src/assets')
    },
    extensions: [
      '.js', '.json', '.css'
    ]
  },
  build: {
    vendor: [],
    publicPath: './',
    sourceMap: true
  },
  dev: {
    port: 8080,
    nativeNotifier: true,
    proxyTable: {
      // '/commonvote': url.parse('https://lzadvertbiz.lizhi.fm/commonvote')
    },
    mockTable: {
      // '/mock': (req, res) => {
      //   res.json(succ({
      //     id: 10086,
      //     name: 'Jack'
      //   }))
      // }
    }
  }
}

function rsv(pathName) {
  return path.resolve(__dirname, '../src')
}

function succ(data, msg = 'ok', status = 0) {
  return {
    status, data, msg
  }
}

function fail(data, msg = 'error', status = 1) {
  return {
    status, data, msg
  }
}
