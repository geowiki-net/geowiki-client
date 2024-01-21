import App from './App'

const baseModules = [
  require('./lang'),
  require('./map'),
  require('./data'),
  require('./layer'),
  require('./config'),
  require('./styleLoader')
]

App.modules = [...baseModules, ...App.modules, ...require('../modules')]

window.onload = function () {
  window.app = new App()
}
