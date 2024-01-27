import yaml from 'js-yaml'
import LeafletGeowiki from 'leaflet-geowiki/minimal'
import App from './App'
import styleLoader from './styleLoader'

module.exports = {
  id: 'layer',
  requireModules: ['data', 'map', 'lang'],
  appInit
}
let app
let timeout = null

function appInit (_app, callback) {
  app = _app

  LeafletGeowiki.modules = [...LeafletGeowiki.modules, ...App.modules]

  app.on('state-apply', state => {
    if (!app.layer || ('styleFile' in state && state.styleFile !== app.options.styleFile) || ('data' in state && state.data !== app.options.data)) {
      changeLayer(app.state.current.styleFile, app.state.current.data)
    }
  })

  app.on('state-get', state => {
    state.styleFile = app.options.styleFile
    state.data = app.options.data
  })

  app.on('lang-change', () => {
    changeLayer(app.options.styleFile, { force: true })
  })

  app.on('data-defined', () => {
    changeLayer(app.options.styleFile, { force: true })
  })

  callback()
}

function changeLayer (styleFile, data, options = {}) {
  if (timeout) {
    global.clearTimeout(timeout)
  }

  timeout = global.setTimeout(() => _changeLayer(styleFile, data, options), 0)
}

function _changeLayer (styleFile, data, options = {}) {
  if (app.layer) {
    app.setNonInteractive(true)
    app.layer.remove()
    app.layer = null
    app.setNonInteractive(false)
  }

  app.options.styleFile = styleFile
  app.options.data = data

  if (!styleFile) {
    return
  }

  Promise.all([
    app.dataSources.get(data),
    styleLoader.get(styleFile)
  ]).then(([data, style]) => {
      app.emit('style-load', style)

      style = yaml.load(style)

      // a layer has been added in the meantime
      if (app.layer) {
        app.setNonInteractive(true)
        app.layer.remove()
        app.layer = null
        app.setNonInteractive(false)
      }

      app.layer = new LeafletGeowiki({
        overpassFrontend: data.dataSource,
        style
      })

      app.setNonInteractive(true)
      if (app.map) {
        app.layer.addTo(app.map)
      }
      app.setNonInteractive(false)

      app.layer.on('load', () => app.emit('layer-load', app.layer))

      app.layer.on('error', error => global.alert(error))
    })
    .catch(error => {
      if (!error.errors) {
        global.alert(error.message)
      } else if (error.errors.length) {
        global.alert(error.errors[0].message)
      } else {
        global.alert('Style file not found')
      }
    })
}
