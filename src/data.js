import OverpassFrontend from 'overpass-frontend'

import isRelativePath from './isRelativePath'
import App from './App'
App.addExtension({
  id: 'data',
  initFun
})
let app

function initFun (_app, callback) {
  app = _app

  app.on('state-apply', state => {
    if (!app.overpassFrontend || state.data !== app.options.data) {
      loadData(state.data ?? app.options.data)
    }
  })

  callback()
}

function loadData (path) {
  app.options.data = path

  if (isRelativePath(path)) {
    path = app.options.dataDirectory + '/' + path
  }

  app.overpassFrontend = new OverpassFrontend(path)
  if (app.overpassFrontend.localOnly) {
    app.overpassFrontend.on('load', (meta) => {
      // TODO: maybe move this to src/map? via state?
      if (typeof app.map.getZoom() === 'undefined') {
        if (meta.bounds) {
          app.map.fitBounds(meta.bounds.toLeaflet())
        }
      }
    })
  }
}
