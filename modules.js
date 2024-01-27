// To enable any of these modules, you first need to add them to your
// applications via 'npm install geowiki-module-xxx'

module.exports = [
  // Render map info into a div
  require('leaflet-geowiki/src/info'),

  // List map features in a div
  require('leaflet-geowiki/src/list'),

  // Render markers on the map
  require('leaflet-geowiki/src/markers'),

  // Create additional panes to layer map features
  require('leaflet-geowiki/src/panes'),

  // Query data from Wikidata
  require('leaflet-geowiki/src/wikidata'),

  // Language support
  require('leaflet-geowiki/src/language'),

  // Translate tag values (with openstreetmap-tag-translations)
  require('leaflet-geowiki/src/tagTranslations'),

  // Enable support for parsing opening_hours tags
  require('geowiki-module-opening-hours'),

  // Evaluate an object against the current stylesheet to get the style (often used in map info)
  require('leaflet-geowiki/src/evaluate'),

  // Support for Opening Hours parser:
  require('geowiki-module-opening-hours'),

  // Add a 'Fullscreen' button to Geowiki Viewer
  // install via 'npm install github:geowiki-net/geowiki-module-fullscreen'
  // require('geowiki-module-fullscreen'),

  // Layer Selector
  require('./src/layer-selector'),
]
