const Events = require('events')
const queryString = require('query-string')
const hash = require('sheet-router/hash')

let map

class State extends Events {
  constructor () {
    super()

    this.defaultState = {}
  }

  init (options, _map) {
    map = _map

    hash(loc => {
      this.apply(loc.substr(1))
    })

    if (global.location.hash) {
      this.apply(global.location.hash)
    } else {
      this.apply('map=' + options.map)
    }
  }

  setDefault (state) {
    this.defaultState = state
  }

  get () {
    const state = {}

    // location
    if (typeof map.getZoom() !== 'undefined') {
      const center = map.getCenter().wrap()
      const zoom = parseInt(map.getZoom())

      state.lat = center.lat
      state.lon = center.lng
      state.zoom = zoom
    }

    // other modules
    this.emit('get', state)

    return state
  }

  apply (state) {
    // location
    if (state.lat && state.lon && state.zoom) {
      if (typeof map.getZoom() === 'undefined') {
        map.setView({ lat: state.lat, lng: state.lon }, state.zoom)
      } else {
        map.flyTo({ lat: state.lat, lng: state.lon }, state.zoom)
      }
    }

    // other modules
    this.emit('apply', state)

    return state
  }

  stringify (state = null) {
    let link = ''

    if (!state) {
      state = this.get()
    }

    // avoid modification of the object
    state = { ...state }

    // path
    if (state.path) {
      link += state.path
      delete state.path
    }

    // location
    let locPrecision = 5
    if (state.zoom) {
      locPrecision =
        state.zoom > 16 ? 5
        : state.zoom > 8 ? 4
        : state.zoom > 4 ? 3
        : state.zoom > 2 ? 2
        : state.zoom > 1 ? 1
        : 0
    }

    if (state.zoom && state.lat && state.lon) {
      link += (link === '' ? '' : '&') + 'map=' +
        parseFloat(state.zoom).toFixed(0) + '/' +
        state.lat.toFixed(locPrecision) + '/' +
        state.lon.toFixed(locPrecision)

      delete state.zoom
      delete state.lat
      delete state.lon
    }

    var newHash = queryString.stringify(state)

    // Characters we don't want escaped
    newHash = newHash.replace(/%2F/g, '/')
    newHash = newHash.replace(/%2C/g, ',')

    if (newHash !== '') {
      link += (link === '' ? '' : '&') + newHash
    }

    return link
  }

  parse (link) {
    var firstEquals = link.search('=')
    var firstAmp = link.search('&')
    var urlNonPathPart = ''
    var newState = {}
    var newPath = ''

    if (link === '') {
      // nothing
    } else if (firstEquals === -1) {
      if (firstAmp === -1) {
        newPath = link
      } else {
        newPath = link.substr(0, firstAmp)
      }
    } else {
      if (firstAmp === -1) {
        urlNonPathPart = link
      } else if (firstAmp < firstEquals) {
        newPath = link.substr(0, firstAmp)
        urlNonPathPart = link.substr(firstAmp + 1)
      } else {
        urlNonPathPart = link
      }
    }

    newState = queryString.parse(urlNonPathPart)
    if (newPath !== '') {
      newState.path = newPath
    }

    if ('map' in newState && newState.map !== 'auto') {
      var parts = newState.map.split('/')
      newState.zoom = parseFloat(parts[0])
      newState.lat = parseFloat(parts[1])
      newState.lon = parseFloat(parts[2])
      delete newState.map
    }

    return newState
  }
}

module.exports = new State()
