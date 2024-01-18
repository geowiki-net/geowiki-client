import App from './App'
import './lang'
import './map'
import './data'
import './layer'
import './config'
import './styleLoader'

App.extensions = require('../extensions')

window.onload = function () {
  return new App()
}
