/* global L:false */

const OverpassFrontend = require('overpass-frontend')
const LeafletGeowiki = require('leaflet-geowiki/all')
const yaml = require('yaml')
const queryString = require('query-string')
const isRelativePath = require('./isRelativePath')
const state = require('./state')

let overpassFrontend
let map
let layer
// the current options as modified by url parameters
let options = { ...config }

function applyState (newState) {
  if (!overpassFrontend || newState.data !== options.data) {
    loadData(newState.data ?? options.data)
  }

  if (!layer || newState.styleFile !== options.styleFile) {
    changeLayer(newState.styleFile ?? options.styleFile)
  }

  updateLink()
}

function getState (newState) {
  newState.styleFile = options.styleFile

  if (options.data !== config.data) {
    newState.data = options.data
  }
}

function loadConfig (callback) {
}

window.onload = function () {
  state.on('apply', applyState)
  state.on('get', getState)
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

  state.init(options, map)

  map.on('moveend', () => updateLink())
}

function loadData (path) {
  options.data = path

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
  global.history.replaceState(null, null, '#' + state.stringify())
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
