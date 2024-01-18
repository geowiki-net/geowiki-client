import App from './App'
import './lang'
import './map'
import './data'
import './layer'
import './config'
import './styleLoader'

const extensions = require('../extensions')

window.onload = function () {
  window.app = new App(extensions)
}
