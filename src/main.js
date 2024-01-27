import App from './App'

const baseModules = [
  require('./lang'),
  require('./map'),
  require('./dataSources'),
  require('./layers'),
  require('./config'),
  require('./styleLoader')
]

App.modules = [...baseModules, ...App.modules, ...require('../modules')]

window.onload = function () {
  window.app = new App()
}
