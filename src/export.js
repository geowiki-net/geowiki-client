import App from './App'

const baseModules = [
  require('./lang'),
  require('./map'),
  require('./data'),
  require('./layer'),
  require('./config'),
  require('./styleLoader')
]

App.modules = [...baseModules, ...App.modules]

module.exports = App
