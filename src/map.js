/* global L:false */
import App from './App'
App.addExtension({
  id: 'map',
  requireExtensions: ['config'],
  initFun
})

function initFun (app, callback) {
  // default app config
  app.config.app = {
    ...{
      name: 'geowiki-viewer',
      url: 'https://github.com/geowiki-net/geowiki-viewer/'
    },
    ...(app.config.app ?? {})
  }

  app.map = L.map('map', { maxZoom: app.config.maxZoom })

  // Show OSM map background
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxNativeZoom: 19,
    maxZoom: app.config.maxZoom,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(app.map)

  app.map.attributionControl.setPrefix('<a target="_blank" href="' + encodeURI(app.config.app.url) + '">' + app.config.app.name + '</a>')

  app.map.on('moveend', (e) => {
    if (app.interactive) {
      app.updateLink()
    } else {
      console.log('skip')
    }
  })

  app.on('state-apply', state => {
    if (state.lat && state.lon && state.zoom) {
      app.setNonInteractive(true)
      if (typeof app.map.getZoom() === 'undefined') {
        app.map.setView({ lat: state.lat, lng: state.lon }, state.zoom)
      } else {
        app.map.flyTo({ lat: state.lat, lng: state.lon }, state.zoom)
      }
      app.setNonInteractive(false)
    }

    if (app.map.getZoom()) {
      if (state.map === 'auto') {
        app.setNonInteractive(true)
        app.getParameter('initial-map-view')
          .then(value => applyView(app.map, value))
        app.setNonInteractive(false)
      }

      return
    }

    app.getParameter('initial-map-view')
      .then(value => {
        app.setNonInteractive(true)
        if (!applyView(app.map, value)) {
          if (app.config.map && app.config.map.defaultView) {
            applyView(app.map, app.config.map.defaultView)
          } else {
            app.map.setView([0, 0], 4)
          }
        }
        app.setNonInteractive(false)
      })
      .catch(err => {
        app.setNonInteractive(true)
        if (app.config.map && app.config.map.defaultView) {
          applyView(app.map, app.config.map.defaultView)
        } else {
          app.map.setView([0, 0], 4)
        }
        app.setNonInteractive(false)
      })
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

function applyView (map, value) {
  if (value.minlon) {
    value.bounds = L.latLngBounds([ value.minlat, value.minlon], [value.maxlat, value.maxlon ])
  }

  if (value.bounds) {
    if (!value.bounds.isValid()) { return false }
    map.fitBounds(value.bounds)
    return true
  }

  if (value.center) {
    map.setView(value.center, value.zoom ?? 12)
    return true
  }
}
