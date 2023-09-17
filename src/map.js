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

  callback()
}
