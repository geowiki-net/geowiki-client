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
 * @property {Object.<function>} layerTypes Hash array of available layer types. By default the 'tms' type is defined. The functions convert a map definition (mapLayer) into a leaflet layer.
 * @property {L.control.layers} control the layer control - only visible when >1 basemap defined.
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
 * @property {string} [type=tms] Type of the layer.
 * @property {string} url URL of the layer, e.g. https://tile.openstreetmap.org/{z}/{x}/{y}.png
 * @property {object} options Additional options, e.g. attribution, maxNativeZoom, subdomains, ...
 */

module.exports = {
  id: 'mapLayers',
  requireModules: ['config', 'map'],
  appInit (app) {
    app.mapLayers = mapLayers

    mapLayers.addBasemap = (def) => {
      const type = def.type ?? 'tms'

      if (!(type in mapLayers.layerTypes)) {
        return console.log(`Can't load layer '${def.id}', layer type '${type}' not defined.`)
      }

      const layer = mapLayers.layerTypes[type](def)

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

    mapLayers.layerTypes = {
      tms: (def) => {
        const options = { ...def.options }
        if (!('maxZoom' in options)) {
          options.maxZoom = app.config.maxZoom
        }

        return L.tileLayer(
          def.url,
          options
        )
      }
    }

    app.on('init', () => {
      const preferredLayer = null
      app.config.basemaps.forEach(def => {
        mapLayers.addBasemap(def)
      })

      const layers = {}
      mapLayers.basemaps.forEach(({ def, layer }) => {
        layers[def.name] = layer
      })

      mapLayers.control = L.control.layers(layers, {})

      if (Object.keys(layers).length > 1) {
        mapLayers.control.addTo(app.map)
      }
    })

    app.map.on('baselayerchange', function (e) {
      const selected = mapLayers.basemaps.filter(({ layer }) => layer === e.layer)
      mapLayers.currentBasemap = selected.length ? selected[0] : null
      if (interactive && app.interactive) {
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
      } else if (!mapLayers.currentBasemap) {
        mapLayers.basemaps[0].layer.addTo(app.map)
      }
      interactive = true
    })
  }
}
