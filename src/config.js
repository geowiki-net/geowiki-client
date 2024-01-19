import yaml from 'js-yaml'

// the config which has been defined here or in config.yaml
import defaultConfig from './defaultConfig.json'

module.exports = {
  id: 'config',
  appInit
}

function appInit (app, callback) {
  app.config = defaultConfig

  global.fetch('config.yaml', {
  })
    .then(req => {
      if (req.status === 404) {
        // not found, using default config
        return '{}'
      }

      if (req.ok) {
        return req.text()
      }

      throw (new Error("Can't load file config.yaml: " + req.statusText))
    })
    .then(body => {
      const _config = yaml.load(body)
      const defaultState = { ...app.config.defaultState, ...(_config.defaultState ?? {}) }

      app.config = { ...app.config, ..._config }
      app.options = { ...defaultState, ...app.state.parse() }

      global.setTimeout(() => callback(), 0)
    })
    .catch(err => {
      const error = new Error('Error loading config file (' + err.message + ')')
      global.setTimeout(() => callback(error), 0)
    })
}
