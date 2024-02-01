import Events from 'events'
import state from './state'
import initModules from 'leaflet-geowiki/src/initModules'

class App extends Events {
  constructor () {
    super()

    this.state = state
    this.initModules(() => this.init())
  }

  initModules (callback) {
    initModules(this, 'appInit', App.modules, (err) => {
      if (err) {
        global.alert(err.message)
      }

      callback()
    })
  }

  init () {
    state.on('get', state => this.emit('state-get', state))
    state.on('apply', state => this.emit('state-apply', state))

    this.options = { ...this.config.defaultState, ...this.state.parse() }

    const promises = []
    this.emit('init', promises)
    state.init(promises)

    Promise.all(promises).then(() => {
      state.apply(this.options)
    })
    .catch(err => {
      global.alert(err.message)
    })
  }

  stateApply (s) {
    state.apply(s)
  }

  updateLink () {
    state.updateLink()
  }

  getParameter (str, fun = 'any') {
    const promises = []
    this.emit(str, promises)
    return Promise[fun](promises)
  }

  setNonInteractive (value) {
    this.interactive = !value
  }
}

App.modules = []
App.addModule = (module) => {
  App.modules.push(module)
}

module.exports = App
