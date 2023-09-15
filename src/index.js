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
// the config which has been defined here or in config.yaml
let config = {
  dataDirectory: 'example',
  data: '//overpass-api.de/api/interpreter',
  map: 'auto',
  maxZoom: 20,
  styleFile: 'style.yaml'
}
// the current options as modified by url parameters
let options = { ...config }

function hashApply (loc) {
  let state = queryString.parse(loc)

  if (state.map === 'auto' && (overpassFrontend && !overpassFrontend.localOnly)) {
    state.map = '4/0/0'
  }

  if ('map' in state && state.map !== 'auto') {
    let parts = state.map.split('/')
    state.zoom = parts[0]
    state.lat = parts[1]
    state.lon = parts[2]
  }

  applyState({ ...options, ...state })
}

function applyState (state) {
  if (state.map !== 'auto') {
    if (typeof map.getZoom() === 'undefined') {
      map.setView({ lat: state.lat, lng: state.lon }, state.zoom)
    } else {
      map.flyTo({ lat: state.lat, lng: state.lon }, state.zoom)
    }
  }

  if (!overpassFrontend || state.data !== options.data) {
    loadData(state.data)
  }

  if (!layer || state.styleFile !== options.styleFile) {
    changeLayer(state.styleFile)
  }

  updateLink()
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
      const _config = yaml.parse(body)
      config = { ...config, ..._config }
      options = { ...config }

      global.setTimeout(() => callback(null), 0)
    })
    .catch(err => {
      console.error('Error loading config (' + err.message + '), using default options instead.')
      global.setTimeout(() => callback(), 0)
    })
}

window.onload = function () {
  loadConfig(init)
}

function init (err) {
  if (err) { console.error(err) }

  map = L.map('map', { maxZoom: options.maxZoom })

  // Show OSM map background
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxNativeZoom: 19,
    maxZoom: options.maxZoom,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map)

  map.attributionControl.setPrefix('<a target="_blank" href="https://github.com/geowiki-net/geowiki-viewer/">geowiki-viewer</a>')

  if (window.location.search) {
    let _options = queryString.parse(window.location.search)
    for (let k in _options) {
      options[k] = _options[k]
    }
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
}

function loadData (path) {
  options.data = path
  options.styleFile = null

  if (isRelativePath(path)) {
    path = options.dataDirectory + '/' + path
  }

  overpassFrontend = new OverpassFrontend(path)
  if (overpassFrontend.localOnly) {
    overpassFrontend.on('load', (meta) => {
      if (typeof map.getZoom() === 'undefined') {
        if (meta.bounds) {
          map.fitBounds(meta.bounds.toLeaflet())
        }
      }
    })
  }
}

function updateLink () {
  const state = {}

  let zoom = map.getZoom()
  if (typeof zoom !== 'undefined') {
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

    state.map = zoom + '/' +
      center.lat.toFixed(locPrecision) + '/' +
      center.lng.toFixed(locPrecision)
  }

  state.styleFile = options.styleFile

  if (options.data !== config.data) {
    state.data = options.data
  }

  const link = queryString.stringify(state)
    .replace(/%2F/g, '/')
    .replace(/%2C/g, ',')
    // Characters we dont's want escaped

  global.history.replaceState(null, null, '#' + link)
}

function changeLayer (styleFile) {
  if (layer) {
    layer.remove()
  }

  options.styleFile = styleFile

  layer = new LeafletGeowiki({
    overpassFrontend,
    styleFile: options.dataDirectory + '/' + styleFile
  }).addTo(map)
}
