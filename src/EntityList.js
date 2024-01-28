import isRelativePath from './isRelativePath'

module.exports = class EntityList {
  constructor (app, config, defaultList) {
    this.app = app
    this.config = config
    this.defaultList = defaultList
    this._list = null
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

      this._list = this.defaultList
      if (this.config) {
        this._list = this.config.list ?? defaultList
      }

      Object.entries(this._list).forEach(([id, item]) => {
        item.id = id

        if (!item.title) {
          item.title = id
        }
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
            return reject(new Error('no entities defined'))
          }

          id = Object.keys(list)[0]
        }

        if (!(id in list)) { // TODO: maybe need to allow additional data sources
          list[id] = {
            id,
            title: id,
            url: id
          }
        }

        const item = list[id]

        if (!item.data) {
          const url = (isRelativePath(item.url) ? this.app.config.dataDirectory + '/' : '') + item.url
          this.resolveItem(item, url)
            .then(() => resolve(item))
        } else {
          resolve(item)
        }
      })
      .catch(err => reject(err))
    })
  }
}
