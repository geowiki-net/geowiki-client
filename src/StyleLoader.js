import EntityList from './EntityList'

const defaultList = {}

/**
 * @typedef Styles#file
 * @property {string} id ID of the file.
 * @property {string} [title] title of the file.
 * @property {string} [url] URL of the file (if any).
 * @property {Promise.<string>} [loader] promise, which will resolve to an URL.
 * @property {string} [data] The source code of the Stylesheet.
 */

/**
 * Request list of styles.
 * @event App#list-styles
 * @param {Promise.<Styles#file[]>} promises push a promise into this array which will resolve into a list of available styles.
 */

/**
 * Request a style by id.
 * @event App#get-style
 * @param {string} id - id of the style we are looking for
 * @param {Promise.<DataSources#file>} promises if the module might return a valid style for the specified id, then push a promise to this array. Only the first promise to resolve will be used.
 */

/**
 * a class which keeps track of all available leaflet-geowiki style sheets.
 * @extends EntityList
 */
class Styles extends EntityList {
  constructor (app) {
    super(app, app.config.styles, defaultList)
    this.on('update', () => app.emit('styles-update'))
    this.on('list-entities', promises => app.emit('list-styles', promises))
    this.on('get-entitiy', (id, promises) => app.emit('get-style', id, promises))

    app.on('refresh', () => {
      this.list(true)
    })
  }

  /**
   * resolves an item to its leaflet-geowiki stylesheet.
   * @param {Styles#file} item A file descriptor
   * @param {string} url
   * @returns {Promise}
   * @private
   */
  resolveItem (item, url) {
    return new Promise((resolve, reject) => {
      const promises = []
      app.emit('style-get', item.url, promises)
      Promise.any(promises)
        .then(body => {
          item.data = body
          resolve()
        })
        .catch(err => {
          reject(err)
        })
    })
  }

  clearCache (file) {
    console.log(file)
  }
}

module.exports = Styles
