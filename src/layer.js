import yaml from 'js-yaml'
import LeafletGeowiki from 'leaflet-geowiki/all'
import styleLoader from './styleLoader'

import App from './App'
App.addExtension({
  id: 'layer',
  requireExtensions: ['data', 'map', 'lang'],
  initFun
})
let app

function initFun (_app, callback) {
  app = _app

  app.on('state-apply', state => {
    if (!app.layer || ('styleFile' in state && state.styleFile !== app.options.styleFile)) {
      changeLayer(state.styleFile)
    }
  })

  app.on('state-get', state => {
    state.styleFile = app.options.styleFile
  })

  app.on('lang-change', () => {
    changeLayer(app.options.styleFile, { force: true })
  })

  callback()
}

function changeLayer (styleFile, options = {}) {
  if (app.layer || options.force) {
    app.layer.remove()
  }

  app.options.styleFile = styleFile

  if (!styleFile) {
    app.layer = null
    return
  }

  styleLoader.get(styleFile)
    .then(style => {
      style = yaml.load(style)

      app.layer = new LeafletGeowiki({
        overpassFrontend: app.overpassFrontend,
        style: style
      })
      app.addMapLayer(app.layer)

      app.layer.on('load', () => app.emit('layer-load', app.layer))

      app.layer.on('error', error => global.alert(error))
    })
    .catch(error => {
      if (!error.errors) {
        global.alert(error.message)
      } else if (error.errors.length) {
        global.alert(error.errors[0].message)
      } else {
        global.alert("Style file not found")
      }
    })
}
