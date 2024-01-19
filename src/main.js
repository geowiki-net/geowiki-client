import App from './App'

const baseModules = [
  require('./lang'),
  require('./map'),
  require('./data'),
  require('./layer'),
  require('./config'),
  require('./styleLoader')
]

App.extensions = [...baseModules, ...App.extensions, ...require('../extensions')]

window.onload = function () {
  window.app = new App()
}
