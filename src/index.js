/* global L:false */

const OverpassFrontend = require('overpass-frontend')
const OverpassLayer = require('overpass-layer')
const yaml = require('yaml')
const queryString = require('query-string')
const hash = require('sheet-router/hash')

let overpassFrontend
let map
let options = {
  dataDirectory: 'example',
  overpass: '//overpass-api.de/api/interpreter',
  map: '4/0/0',
  style: 'style.yaml'
}

function hashApply (loc) {
  let state = queryString.parse(loc)

  if ('map' in state) {
    let parts = state.map.split('/')
    state.zoom = parts[0]
    state.lat = parts[1]
    state.lon = parts[2]

    if (typeof map.getZoom() === 'undefined') {
      map.setView({ lat: state.lat, lng: state.lon }, state.zoom)
    } else {
      map.flyTo({ lat: state.lat, lng: state.lon }, state.zoom)
    }
  }
}

function loadConfig (callback) {
  global.fetch('config.yaml')
    .then(req => {
      if (req.ok) {
        return req.text()
      }

      throw (new Error("Can't load file config.yaml: " + req.statusText))
    })
    .then(body => {
      let _options = yaml.parse(body)

      for (let k in _options) {
        options[k] = _options[k]
      }

      callback(null)
    })
    .catch(err => global.setTimeout(() => callback(err), 0))
}

function loadStyle (file, callback) {
  global.fetch(options.dataDirectory + '/' + file)
    .then(req => {
      if (req.ok) {
        return req.text()
      }

      throw (new Error("Can't load file " + options.dataDirectory + "/" + file + ': ' + req.statusText))
    })
    .then(body => {
      let style = yaml.parse(body)
      callback(null, style)
    })
    .catch(err => global.setTimeout(() => callback(err), 0))
}

window.onload = function () {
  loadConfig(init)
}

function init (err) {
  if (err) { console.error(err) }

  map = L.map('map', { maxZoom: 22 })

  map.attributionControl.setPrefix('<a target="_blank" href="https://github.com/geowiki-net/geowiki-viewer/">geowiki-viewer</a>')

  if (window.location.search) {
    let _options = queryString.parse(window.location.search)
    for (let k in _options) {
      options[k] = _options[k]
    }
  }

  if (options.data) {
    options.overpass = options.dataDirectory + '/' + options.data
  }

  overpassFrontend = new OverpassFrontend(options.overpass)
  if (options.data) {
    overpassFrontend.on('load', (meta) => {
      if (meta.bounds && typeof map.getZoom() === 'undefined') {
        map.fitBounds(meta.bounds.toLeaflet())
      }
    })
  }

  hash(loc => {
    hashApply(loc.substr(1))
  })
  if (global.location.hash) {
    hashApply(global.location.hash)
  } else {
    hashApply('map=' + options.map)
  }

  map.on('moveend', () => {
    let center = map.getCenter().wrap()
    let zoom = parseFloat(map.getZoom()).toFixed(0)

    var locPrecision = 5
    if (zoom) {
      locPrecision =
        zoom > 16 ? 5
          : zoom > 8 ? 4
            : zoom > 4 ? 3
              : zoom > 2 ? 2
                : zoom > 1 ? 1
                  : 0
    }

    const link = 'map=' +
      zoom + '/' +
      center.lat.toFixed(locPrecision) + '/' +
      center.lng.toFixed(locPrecision)

    global.history.replaceState(null, null, '#' + link)
  })

  loadStyle(options.style, (err, style) => {
    if (err) { return global.alert(err) }

    if (style.tileLayers && style.tileLayers.length === 1) {
      let layer = style.tileLayers[0]
      L.tileLayer(layer.url, layer).addTo(map)
    } else if (style.tileLayers && style.tileLayers.length > 1) {
      let layers = {}
      style.tileLayers.forEach((layer, i) => {
        let l = L.tileLayer(layer.url, layer)
        layers[layer.title || ('Layer #' + i)] = l
        if (i === 0) {
          l.addTo(map)
        }
      })
      L.control.layers(layers).addTo(map)
    } else {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
      }).addTo(map)
    }

    if (style.panes) {
      for (const paneId in style.panes) {
        const pane = map.createPane(paneId)
        if (style.panes[paneId]) {
          for (const k in style.panes[paneId]) {
            pane.style[k] = style.panes[paneId][k]
          }
        }
      }
    }

    if (!style.layers) {
      style.layers = []
    }

    style.layers.forEach(def => {
      if (!def.feature) {
        def.feature = {}
      }

      if (!('markerSymbol' in def.feature)) {
        def.feature.markerSymbol = ''
      }

      if (!('title' in def.feature)) {
        def.feature.title = '{{ tags.name }}'
      }

      if (!('body' in def.feature)) {
        def.feature.body = '{{ tags.description }}'
      }

      new OverpassLayer({
        overpassFrontend,
        query: def.query,
        minZoom: 0,
        feature: def.feature
      }).addTo(map)
    })
  })
}
