import LeafletGeowiki from 'leaflet-geowiki/all'

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
    if (!app.layer || state.styleFile !== app.options.styleFile) {
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

  app.layer = new LeafletGeowiki({
    overpassFrontend: app.overpassFrontend,
    styleFile: app.options.dataDirectory + '/' + styleFile
  })
  app.addMapLayer(app.layer)

  app.layer.on('load', () => app.emit('layer-load', app.layer))

  app.layer.on('error', error => global.alert(error))
}
