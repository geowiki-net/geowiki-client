import EntityList from './EntityList'

const defaultList = {}

module.exports = class Styles extends EntityList {
  constructor (app) {
    super(app, app.config.styles, defaultList)
    this.on('update', () => app.emit('styles-update'))
    this.on('list-entities', promises => app.emit('list-styles', promises))

    app.on('refresh', () => {
      this.list(true)
    })
  }

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
}
