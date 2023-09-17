import App from './App'
const yaml = require('yaml')

// the config which has been defined here or in config.yaml
import defaultConfig from './defaultConfig.json'

App.addExtension({
  id: 'config',
  initFun
})

function initFun (app, callback) {
  app.config = defaultConfig

  global.fetch('config.yaml')
    .then(req => {
      if (req.ok) {
        return req.text()
      }

      throw (new Error("Can't load file config.yaml: " + req.statusText))
    })
    .then(body => {
      const _config = yaml.parse(body)
      app.config = { ...app.config, ..._config }

      global.setTimeout(() => callback(null), 0)
    })
    .catch(err => {
      console.error('Error loading config (' + err.message + '), using default options instead.')
      global.setTimeout(() => callback(), 0)
    })
}
