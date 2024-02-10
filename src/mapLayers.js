const mapLayers = {
  basemaps: [],
  currentBasemap: null
}

let interactive = true

/**
 * @typedef mapLayers interface to the basemaps of the current map.
 * @property {mapLayerEntry[]} basemaps List of available basemaps.
 * @property {mapLayerEntry} [currentBasemap] currently selected basemap.
 * @property {function} addBasemap Add a basemap. Expects a {mapLayer}.
 * @property {string|null} selectBasemap Select the basemap map layer with the id / mapLayer definition / leaflet layer.
 */

/**
 * @typedef mapLayerEntry
 * @property {string} id
 * @property {mapLayer} def
 * @property {Leaflet} layer
 */

/**
 * Definition of a map layer.
 * @typedef mapLayer
 * @property {string} id ID of the map layer (Tile Map Service)
 * @property {string} name Human name of the map layer
 * @property {string} url URL of the layer, e.g. https://tile.openstreetmap.org/{z}/{x}/{y}.png
 * @property {object} options Additional options, e.g. attribution, maxNativeZoom, subdomains, ...
 */

module.exports = {
  id: 'mapLayers',
  requireModules: ['config', 'map'],
  appInit (app) {
    app.mapLayers = mapLayers

    mapLayers.addBasemap = (def) => {
      const options = { ...def.options }
      if (!('maxZoom' in options)) {
        options.maxZoom = app.config.maxZoom
      }

      const layer = L.tileLayer(
        def.url,
        options
      )

      layers[def.name] = layer
      mapLayers.basemaps.push({ id: def.id, def, layer })
    }

    mapLayers.selectBasemap = (basemap, interactive=true) => {
      if (mapLayers.currentBasemap) {
        app.map.removeLayer(mapLayers.currentBasemap.layer)
      }

      const current = mapLayers.basemaps.filter(({ id }) => id === basemap)
      if (current.length) {
        current[0].layer.addTo(app.map)
      }
    }

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
      mapLayers.addBasemap(def)
    })

    L.control.layers(layers).addTo(app.map)

    app.map.on('baselayerchange', function (e) {
      const selected = mapLayers.basemaps.filter(({ layer }) => layer === e.layer)
      mapLayers.currentBasemap = selected.length ? selected[0] : null
      if (interactive) {
        app.updateLink()
      }
    })

    app.on('state-get', state => {
      state.basemap = mapLayers.currentBasemap ? mapLayers.currentBasemap.id : ''
    })

    app.on('state-apply', state => {
      interactive = false
      if (state.basemap) {
        mapLayers.selectBasemap(state.basemap, false)
      } else if (!currentMapLayer) {
        mapLayers.basemaps[0].layer.addTo(app.map)
      }
      interactive = true
    })
  }
}
