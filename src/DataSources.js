import OverpassFrontend from 'overpass-frontend'
import EntityList from './EntityList'

const defaultList = {
  osm: {
    title: 'OpenStreetMap Overpass',
    url: 'https://overpass-api.de/api/interpreter'
  }
}

module.exports = class DataSources extends EntityList {
  constructor (app) {
    super(app, app.config.dataSources, defaultList)
  }

  resolveItem (item, url) {
    if (!item.dataSource) {
      item.dataSource = new OverpassFrontend(url, item.options)
    }
  }
}
