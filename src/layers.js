import yaml from 'js-yaml'
import eachOf from 'async/eachOf'
import LeafletGeowiki from 'leaflet-geowiki/minimal'
import LeafletGeowikiLayer from './LeafletGeowikiLayer'
import App from './App'

module.exports = {
  id: 'layers',
  requireModules: ['data', 'map', 'lang'],
  appInit
}
let app
let timeout = null

function appInit (_app, callback) {
  app = _app

  LeafletGeowiki.modules = [...LeafletGeowiki.modules, ...App.modules]

  app.state.parameters.layers = {
    parse (v) {
      return v.split(/,/).map(v => {
        v = v.split(/:/)

        return {
          styleFile: v[0],
          data: v[1]
        }
      })
    },

    stringify (v) {
      return v.map(p => {
        return p && p.styleFile && p.data ? p.styleFile + ':' + p.data : ''
      }).filter(v => v).join(',')
    }
  }

  app.on('state-apply', state => {
    let layers

    if (app.state.current.layers) {
      layers = app.state.current.layers
    } else {
      layers = [{
        styleFile: app.state.current.styleFile,
        data: app.state.current.data
      }]
    }

    changeLayers(layers)
  })

  app.on('state-get', state => {
    // TODO: might still return an old set of layers
    state.layers = app.layers.map(l => {
      return l.parameters ? { ...l.parameters } : null
    })
  })

  app.on('lang-change', () => {
    changeLayers(null, { force: true })
  })

  app.on('data-defined', () => {
    changeLayers(null, { force: true })
  })

  callback()
}

function changeLayers (layerParameters, options = {}) {
  if (timeout) {
    global.clearTimeout(timeout)
  }

  timeout = global.setTimeout(() => _changeLayer(layerParameters, options), 0)
}

function _changeLayer (layerParameters, options = {}) {
  let change = false
  if (typeof layerParameters === 'string') {
    layerParameters = app.state.parameters.layers.parse(layerParameters)
  }

  if (!app.layers) {
    app.layers = []
  }

  if (layerParameters === null) {
    layerParameters = app.layers.map(l => l.parameters)
  }

  for (let i = layerParameters.length; i < app.layers.length; i++) {
    app.layers[i].hide()
    change = true
  }

  eachOf(layerParameters, (layerParameter, i, done) => {
    if (!app.layers[i]) {
      app.layers[i] = new LeafletGeowikiLayer(app)
    }

    app.layers[i].change(layerParameter, (err, _change) => {
      if (_change) {
        change = true
      }

      done(err)
    })
  }, (err) => {
    if (err) {
      global.alert(err.message)
    }

    if (change) {
      app.updateLink()
      app.emit('layers-update')
    }
  })
}
