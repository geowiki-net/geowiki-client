import Events from 'events'
import yaml from 'js-yaml'
import LeafletGeowiki from 'leaflet-geowiki/minimal'

/**
 * The parameters of a layer
 * @typedef LeafletGeowikiLayer#parameters
 * @property {string} parameters.styleFile The id of the style file
 * @property {string} parameters.data The id of the data source
 */

/**
 * handles one geowiki layer
 * @property {LeafletGeowiki} layer The leaflet-geowiki layer
 * @property {LeafletGeowikiLayer#parameters} parameters The current parameters
 */
class LeafletGeowikiLayer extends Events {
  /**
   * Constructor
   * @param {App} app
   */
  constructor (app) {
    super()

    this.app = app
    this.parameters = null
  }

  /**
   * Change the layer according to the passed paramters
   * @param {LeafletGeowiki#parameters} parameters new parameters
   * @param {function} callback if successful, the value of the callback will be true, if the layer parameters had changed.
   */
  change (parameters, callback) {
    if (this.layer && parameters && parameters.styleFile === this.parameters.styleFile && parameters.data === this.parameters.data) {
      return callback(null, false)
    }

    if (this.layer) {
      this.app.setNonInteractive(true)
      this.emit('layer-hide', this.layer)
      this.layer.remove()
      this.layer = null
      this.app.setNonInteractive(false)
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
   * hide this layer
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

module.exports = LeafletGeowikiLayer
