import OverpassFrontend from 'overpass-frontend'
import EntityList from './EntityList'

const defaultList = {
  osm: {
    title: 'OpenStreetMap Overpass',
    url: 'https://overpass-api.de/api/interpreter'
  }
}

/**
 * @typedef DataSources#file
 * @property {string} id ID of the file.
 * @property {string} [title] title of the file.
 * @property {string} [url] URL of the file (if any).
 * @property {Promise.<string>} [loader] promise, which will resolve to an URL.
 * @property {object} [options] Additional options which will be passed to the OverpassFrontend constructor.
 * @property {OverpassFrontend} [data] When the data sources has been loaded, the reference is stored in this property.
 */

/**
 * Request list of data sources.
 * @event App#list-data-sources
 * @param {Promise.<DataSources#file[]>} promises push a promise into this array which will resolve into a list of available data sources.
 */

/**
 * Request a data source by id.
 * @event App#get-data-source
 * @param {string} id - id of the data source we are looking for
 * @param {Promise.<DataSources#file>} promises if the module might return a valid data source for the specified id, then push a promise to this array. Only the first promise to resolve will be used.
 */

/**
 * a class which keeps track of all available data sources.
 * @extends EntityList
 */
class DataSources extends EntityList {
  constructor (app) {
    super(app, app.config.dataSources, defaultList)
    this.on('update', () => app.emit('data-sources-update'))
    this.on('list-entities', promises => app.emit('list-data-sources', promises))
    this.on('get-entity', (id, promises) => app.emit('get-data-source', id, promises))

    app.on('refresh', () => {
      this.list(true)
    })
  }

  /**
   * resolves an item to its OverpassFrontend instance.
   * @param {DataSources#file} item A file descriptor
   * @param {string} url
   * @returns {Promise}
   * @private
   */
  resolveItem (item, url) {
    return new Promise((resolve) => {
      if (!item.data) {
        item.data = new OverpassFrontend(url, item.options)
      }

      resolve()
    })
  }
}

module.exports = DataSources
