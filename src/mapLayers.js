const mapLayers = []
let currentMapLayer = null

module.exports = {
  id: 'mapLayers',
  requireModules: ['config', 'map'],
  appInit (app) {
    if (!app.config.basemaps) {
      // Show OSM map background
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxNativeZoom: 19,
        maxZoom: app.config.maxZoom,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(app.map)

      return
    }

    const layers = {}
    const preferredLayer = null
    app.config.basemaps.forEach(def => {
      const options = { ...def.options }
      if (!('maxZoom' in options)) {
        options.maxZoom = app.config.maxZoom
      }

      const layer = L.tileLayer(
        def.url,
        options
      )

      layers[def.name] = layer
      mapLayers.push({ def, layer })
    })

    L.control.layers(layers).addTo(app.map)

    app.map.on('baselayerchange', function (e) {
      currentMapLayer = e.layer
      app.updateLink()
    })

    app.on('state-get', state => {
      const current = mapLayers.filter(({ def, layer }) => layer === currentMapLayer)
      state.basemap = current.length ? current[0].def.id : ''
    })

    app.on('state-apply', state => {
      if (state.basemap) {
        if (currentMapLayer) {
          app.map.removeLayer(currentMapLayer)
        }

        const current = mapLayers.filter(({ def, layer }) => def.id === state.basemap)
        if (current.length) {
          current[0].layer.addTo(app.map)
        }
      } else if (!currentMapLayer) {
        mapLayers[0].layer.addTo(app.map)
      }
    })
  }
}
