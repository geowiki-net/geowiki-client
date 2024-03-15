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

  // Add a 'Fullscreen' button to Geowiki Viewer
  require('geowiki-module-fullscreen'),

  // Layer Selector
  require('geowiki-module-layer-selector'),

  // Load Styles from data/-Directory
  require('./src/styleLoaderFromData'),

  // Load Styles from browser localStorage
  require('./src/customStyles'),

  // Add a Style Editor to the layer actions
  require('./src/actionStyleEditor'),

  // Add a Style Editor to the layer actions
  require('./src/actionReloadStyle'),

  // Show tile-based basemaps and overlays
  require('./src/mapLayers'),

  // Show a layer control for basemaps and overlays
  require('./src/mapLayersControl'),

  // List files in the data directory and add them as available Stylesheet resp. data sources
  require('./src/listDataDirectory'),

  // Actions in Layer Selector
  require('./src/actionZoomOnData.js'),

  // Enable the upload of Styles and Data Sources
  require('geowiki-module-upload-file'),

  // Add a download icon to the layer actions
  require('geowiki-module-download-features'),
]
