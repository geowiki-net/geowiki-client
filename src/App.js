import Events from 'events'
import state from './state'
import initExtensions from './initExtensions'

const extensions = {}

class App extends Events {
  constructor (_extensions) {
    super()

    if (_extensions) {
      _extensions.forEach(e => extensions[e.id] = e)
    }

    this.extensions = extensions
    this.state = state
    this.initExtensions(() => this.init())
  }

  initExtensions (callback) {
    initExtensions(this, 'appInit', this.extensions, (err) => {
      if (err) {
        global.alert(err.message)
      }

      callback()
    })
  }

  init () {
    state.on('get', state => this.emit('state-get', state))
    state.on('apply', state => this.emit('state-apply', state))

    this.emit('init')
    state.init()

    state.apply(this.options)
  }

  stateApply (s) {
    state.apply(s)
  }

  updateLink () {
    state.updateLink()
  }

  getParameter (str, fun='any') {
    const promises = []
    this.emit(str, promises)
    return Promise[fun](promises)
  }

  setNonInteractive (value) {
    this.interactive = !value
  }
}

App.addExtension = (extension) => {
  extensions[extension.id] = extension
}

module.exports = App
