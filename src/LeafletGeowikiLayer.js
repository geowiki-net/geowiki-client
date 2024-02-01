import Events from 'events'
import yaml from 'js-yaml'
import LeafletGeowiki from 'leaflet-geowiki/minimal'

module.exports = class LeafletGeowikiLayer extends Events {
  constructor (app) {
    super()

    this.app = app
    this.parameters = null
  }

  /**
   * @returns boolean true if layer parameters changed
   */
  change (parameters, callback) {
    if (this.layer && parameters && parameters.styleFile === this.parameters.styleFile && parameters.data === this.parameters.data) {
      return callback(null, false)
    }

    if (this.layer) {
      app.setNonInteractive(true)
      this.emit('layer-hide', this.layer)
      this.layer.remove()
      this.layer = null
      app.setNonInteractive(false)
    }

    if (!parameters || !parameters.styleFile) {
      return callback(null, false)
    }

    this.parameters = { ...parameters }

    Promise.all([
      this.app.dataSources.get(parameters.data),
      this.app.styleLoader.get(parameters.styleFile)
    ]).then(([data, style]) => {
      this.parameters.data = data.id

      this.overpassFrontend = data.data

      this.app.emit('style-load', style.data)

      style = yaml.load(style.data)

      // a layer has been added in the meantime
      if (this.layer) {
        this.app.setNonInteractive(true)
        this.layer.remove()
        this.app.setNonInteractive(false)
      }

      this.layer = new LeafletGeowiki({
        overpassFrontend: data.data,
        style
      })

      this.app.setNonInteractive(true)
      if (this.app.map) {
        this.layer.addTo(this.app.map)
      }
      this.app.setNonInteractive(false)

      this.layer.on('load', () => this.app.emit('layer-load', this.layer))

      this.layer.on('error', error => global.alert(error))
      this.emit('layer-show', this.layer)

      callback(null, true)
    })
  }

  /**
   */
  hide () {
    this.app.setNonInteractive(true)
    this.emit('layer-hide', this.layer)
    this.layer.remove()
    this.layer = null
    this.parameters = null
    this.app.setNonInteractive(false)
  }
}
