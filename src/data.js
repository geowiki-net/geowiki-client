import OverpassFrontend from 'overpass-frontend'

import isRelativePath from './isRelativePath'
import App from './App'
App.addExtension({
  id: 'data',
  requireExtensions: ['map'],
  appInit
})
let app

function appInit (_app, callback) {
  app = _app

  app.on('state-apply', state => {
    if (!app.overpassFrontend || ('data' in state && state.data !== app.options.data)) {
      loadData(state.data)
      app.emit('data-defined')
    }
  })

  app.on('initial-map-view', promises => {
    promises.push(new Promise((resolve, reject) => {
      app.once('data-defined', () => {
        if (app.overpassFrontend.localOnly) {
          app.overpassFrontend.on('load', meta => {
            if (meta.bounds) {
              resolve({
                type: 'bounds',
                bounds: meta.bounds.toLeaflet()
              })
            } else {
              reject()
            }
          })
        } else {
          reject()
        }
      })
    }))
  })

  callback()
}

function loadData (path) {
  app.options.data = path

  if (isRelativePath(path)) {
    path = app.config.dataDirectory + '/' + path
  }

  app.overpassFrontend = new OverpassFrontend(path)

  app.overpassFrontend.on('error', err => {
    global.alert(err.statusText)
  })
}
