import modulekitLang from 'modulekit-lang'

let mapLayersControl

module.exports = {
  id: 'mapLayersControl',
  requireModules: ['mapLayers', 'config', 'map', 'lang'],
  appInit (app) {
    mapLayersControl = L.control.layers({}, {})

    app.on('mapLayers-change', () => _refreshControl())
    app.on('lang-change', () => _refreshControl())

    function _refreshControl () {
      const layers = {}
      app.mapLayers.basemaps.forEach(({ def, layer }) => {
        mapLayersControl.removeLayer(layer)
        const name = modulekitLang.lang(def.name)
        mapLayersControl.addBaseLayer(layer, name)
      })

      if (Object.keys(app.mapLayers.basemaps).length > 1) {
        mapLayersControl.addTo(app.map)
      }
    }
  }
}
