import Events from 'events'
const async = {
  each: require('async/each'),
  parallel: require('async/parallel')
}
import state from './state'

const extensions = {}

class App extends Events {
  constructor () {
    super()

    this.initExtensions(() => this.init())
  }

  initExtensions (callback) {
    const loadableExtensions = Object.entries(extensions)
      .filter(([ id, extension ]) => {
        if (extension.done) {
          return false
        }

        if (extension.requireExtensions) {
          if (!extension.requireExtensions.filter(rId => extensions[rId] && extensions[rId].done).length) {
            return false
          }
        }

        return true
      })

    if (!loadableExtensions.length) {
      return callback()
    }

    async.each(loadableExtensions, ([id, extension], done) => {
      if (!extension.initFun) {
        extension.done = true
        return done()
      }

      extension.initFun(this, (err) => {
        if (err) {
          console.log('error init', id, err)
          return global.alert(err.message)
        }

        extension.done = true
        return done()
      })
    }, () => this.initExtensions(callback))
  }

  init () {
    console.log('init')
    state.on('get', state => this.emit('state-get', state))
    state.on('apply', state => this.emit('state-apply', state))

    this.options = { ...this.config }
    state.init(this.options, this.map)

    this.options = { ...this.options, ...state.parse() }
    state.apply()
  }

  updateLink () {
    state.updateLink()
  }
}

App.addExtension = (extension) => {
  extensions[extension.id] = extension
}

module.exports = App
