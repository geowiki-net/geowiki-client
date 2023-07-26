/* global L:false */

const OverpassFrontend = require('overpass-frontend')
const LeafletGeowiki = require('leaflet-geowiki/all')
const yaml = require('yaml')
const queryString = require('query-string')
const hash = require('sheet-router/hash')
const isRelativePath = require('./isRelativePath')

let overpassFrontend
let map
let layer
let options = {
  dataDirectory: 'example',
  data: '//overpass-api.de/api/interpreter',
  map: 'auto',
  styleFile: 'style.yaml'
}

function hashApply (loc) {
  let state = queryString.parse(loc)

  if (state.map === 'auto' && !overpassFrontend.localOnly) {
    state.map = '4/0/0'
  }

  if ('map' in state && state.map !== 'auto') {
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

  if ('styleFile' in state && state.styleFile !== options.styleFile) {
    changeLayer(state.styleFile)
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
    .catch(err => {
      console.error("Error loading config (" + err.message + "), using default options instead.")
      global.setTimeout(() => callback(), 0)
    })
}

window.onload = function () {
  loadConfig(init)
}

function init (err) {
  if (err) { console.error(err) }

  map = L.map('map', { maxZoom: 22 })

  // Show OSM map background
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxNativeZoom: 19,
      maxZoom: 22,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  map.attributionControl.setPrefix('<a target="_blank" href="https://github.com/geowiki-net/geowiki-viewer/">geowiki-viewer</a>')

  if (window.location.search) {
    let _options = queryString.parse(window.location.search)
    for (let k in _options) {
      options[k] = _options[k]
    }
  }

  if (isRelativePath(options.data)) {
    options.data = options.dataDirectory + '/' + options.data
  }

  overpassFrontend = new OverpassFrontend(options.data)
  if (overpassFrontend.localOnly) {
    overpassFrontend.on('load', (meta) => {
      if (typeof map.getZoom() === 'undefined') {
        if (meta.bounds) {
          map.fitBounds(meta.bounds.toLeaflet())
        }
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

  map.on('moveend', () => updateLink())

  changeLayer(options.styleFile)
}

function updateLink () {
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
    center.lng.toFixed(locPrecision) + '&' +
    'styleFile=' + options.styleFile

  global.history.replaceState(null, null, '#' + link)
}

function changeLayer (styleFile) {
  if (layer) {
    map.removeLayer(layer)
  }

  options.styleFile = styleFile

  layer = new LeafletGeowiki({
    overpassFrontend,
    styleFile: options.dataDirectory + '/' + styleFile
  }).addTo(map)
}
