import OverpassFrontend from 'overpass-frontend'
import isRelativePath from './isRelativePath'

const defaultList = {
  osm: {
    title: 'OpenStreetMap Overpass',
    url: 'https://overpass-api.de/api/interpreter'
  }
}

module.exports = class DataSources {
  constructor (app) {
    this.app = app
    this._list = null
    this._sources = {}
  }

  /**
   * list all available data source
   * @returns Promise will resolve to a list of data source
   */
  list () {
    return new Promise((resolve, reject) => {
      if (this._list) {
        return resolve(this._list)
      }

      this._list = app.config.dataSources ?? defaultList
      Object.entries(this._list).forEach(([id, item]) => {
        item.id = id
      })

      resolve(this._list)
    })
  }

  /**
   * get the datasource with the specified ID
   * @param string [id] the id of the data source. if null, the default (first in list) data source will be returned. if the data source is not loaded, a new data source with the URL derived from the id will be created.
   * @returns Promise will resolve to an OverpassFrontend object
   */
  get (id) {
    return new Promise((resolve, reject) => {
      this.list().then(list => {
        if (!id) {
          if (!Object.keys(list).length) {
            return reject(new Error('no data sources defined'))
          }

          id = Object.keys(list)[0]
        }

        if (!(id in list)) { // TODO: maybe need to allow additional data sources
          list[id] = {
            id,
            title: id,
            url: (isRelativePath(id) ? this.app.config.dataDirectory + '/' : '') + id
          }
        }

        const item = list[id]

        if (!item.dataSource) {
          item.dataSource = new OverpassFrontend(item.url, item.options)
        }

        resolve(item)
      })
      .catch(err => reject(err))
    })
  }
}
