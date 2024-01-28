import yaml from 'js-yaml'
import eachOf from 'async/eachOf'
import LeafletGeowiki from 'leaflet-geowiki/minimal'
import App from './App'
import styleLoader from './styleLoader'

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
      return v.map(layer => {
        return layer.styleFile && layer.data ? layer.styleFile + ':' + layer.data : ''
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
      return { data: l.data, styleFile: l.styleFile }
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

function changeLayers (layers, options = {}) {
  if (timeout) {
    global.clearTimeout(timeout)
  }

  timeout = global.setTimeout(() => _changeLayer(layers, options), 0)
}

function _changeLayer (layers, options = {}) {
  let change = false
  if (typeof layers === 'string') {
    layers = app.state.parameters.layers.parse(layers)
  }

  if (!app.layers) {
    app.layers = []
  }

  if (layers === null) {
    layers = app.layers
  }

  for (let i = layers.length; i < app.layers.length; i++) {
    app.setNonInteractive(true)
    if (app.layers[i] && app.layers[i].layer) {
      app.layers[i].layer.remove()
      delete app.layers[i]
    }
    app.setNonInteractive(false)

    change = true
  }

  eachOf(layers, (layer, i, done) => {
    if (!app.layers[i]) {
      app.layers[i] = {}
    }

    const currentLayer = app.layers[i]

    if (currentLayer.layer && layer.styleFile === currentLayer.styleFile && layer.data === currentLayer.data) {
      return done()
    } else if (currentLayer.layer) {
      app.setNonInteractive(true)
      currentLayer.layer.remove()
      currentLayer.layer = null
      app.setNonInteractive(false)
    }

    currentLayer.styleFile = layer.styleFile
    currentLayer.data = layer.data
    change = true

    if (!currentLayer.styleFile) {
      return done()
    }

    Promise.all([
      app.dataSources.get(currentLayer.data),
      styleLoader.get(currentLayer.styleFile)
    ]).then(([data, style]) => {
      currentLayer.data = data.id

      app.emit('style-load', style)

      style = yaml.load(style)

      // a layer has been added in the meantime
      if (currentLayer.layer) {
        app.setNonInteractive(true)
        currentLayer.layer.remove()
        app.setNonInteractive(false)
      }

      let layer = new LeafletGeowiki({
        overpassFrontend: data.data,
        style
      })
      currentLayer.layer = layer

      app.setNonInteractive(true)
      if (app.map) {
        layer.addTo(app.map)
      }
      app.setNonInteractive(false)

      layer.on('load', () => app.emit('layer-load', app.layer))

      layer.on('error', error => global.alert(error))

      done()
    })
    .catch(error => {
      if (!error.errors) {
        global.alert(error.message)
      } else if (error.errors.length) {
        global.alert(error.errors[0].message)
      } else {
        global.alert('Style file not found')
      }

      done()
    })
  }, (err) => {
    if (change) {
      app.updateLink()
      app.emit('layers-update')
    }
  })
}
