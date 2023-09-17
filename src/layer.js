import LeafletGeowiki from 'leaflet-geowiki/all'

import App from './App'
App.addExtension({
  id: 'layer',
  requireExtensions: ['data', 'map'],
  initFun
})
let app

function initFun (_app, callback) {
  app = _app

  app.on('state-apply', state => {
    if (!app.layer || state.styleFile !== app.options.styleFile) {
      changeLayer(state.styleFile ?? app.options.styleFile)
    }
  })

  app.on('state-get', state => {
    state.styleFile = app.options.styleFile
  })

  callback()
}

function changeLayer (styleFile) {
  if (app.layer) {
    app.layer.remove()
  }

  app.options.styleFile = styleFile

  app.layer = new LeafletGeowiki({
    overpassFrontend: app.overpassFrontend,
    styleFile: app.options.dataDirectory + '/' + styleFile
  }).addTo(app.map)
}
