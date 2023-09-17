/* global L:false */
const yaml = require('yaml')
const queryString = require('query-string')
const state = require('./state')

let map
let layer
// the current options as modified by url parameters
let options = { ...config }

function applyState (newState) {
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

  if (window.location.search) {
    let _options = queryString.parse(window.location.search)
    for (let k in _options) {
      options[k] = _options[k]
    }
  }

  state.init(options, map)

  map.on('moveend', () => updateLink())
}

function updateLink () {
  state.updateLink()
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
