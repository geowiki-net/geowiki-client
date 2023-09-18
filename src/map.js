/* global L:false */
import App from './App'
App.addExtension({
  id: 'map',
  requireExtensions: ['config'],
  initFun
})

function initFun (app, callback) {
  app.map = L.map('map', { maxZoom: app.config.maxZoom })

  // Show OSM map background
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxNativeZoom: 19,
    maxZoom: app.config.maxZoom,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(app.map)

  app.map.attributionControl.setPrefix('<a target="_blank" href="https://github.com/geowiki-net/geowiki-viewer/">geowiki-viewer</a>')

  app.map.on('moveend', () => app.updateLink())

  app.on('state-apply', state => {
    if (state.lat && state.lon && state.zoom) {
      if (typeof app.map.getZoom() === 'undefined') {
        app.map.setView({ lat: state.lat, lng: state.lon }, state.zoom)
      } else {
        app.map.flyTo({ lat: state.lat, lng: state.lon }, state.zoom)
      }
    }
  })

  app.on('state-get', state => {
    if (typeof app.map.getZoom() !== 'undefined') {
      const center = app.map.getCenter().wrap()
      const zoom = parseInt(app.map.getZoom())

      state.lat = center.lat
      state.lon = center.lng
      state.zoom = zoom
    }
  })

  callback()
}
