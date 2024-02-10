import Events from 'events'
import state from './state'
import initModules from 'leaflet-geowiki/src/initModules'

/**
 * main Geowiki application
 * @fires App#init
 * @property {Leaflet} map The main map of the App.
 * @property {State} state Access to the state interface.
 */
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
    /**
     * After loading all modules, the 'init' event is emitted.
     * @event App#init
     * @param {Promises[]} promises - if your init function needs to run async, you may add a promise. After all promises resolved, the execution continues.
     */
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

  /**
   * refresh the display of UI elements
   * @fires App#refresh
   */
  refresh () {
    /**
     * UI elements can listen to this event. If it fires, they are requested to update their state.
     * @event App#refresh
     */
    this.emit('refresh')
  }
}

App.modules = []
App.addModule = (module) => {
  App.modules.push(module)
}

module.exports = App
