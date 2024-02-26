const Twig = require('twig')

const twigTemplates = {}
defaultOptions = {
  autoescape: true,
  rethrow: true
}

module.exports = function twigGet (template, data, options = {}, callback) {
  if (typeof template !== 'string') {
    return template
  }

  if (typeof options === 'function') {
    callback = options
    options = {}
  }

  options = { ...defaultOptions, ...options }

  if (!(template in twigTemplates)) {
    try {
      options.data = template
      twigTemplates[template] = Twig.twig(options)
    } catch (e) {
      const error = 'Error compiling Twig template: ' + e.message

      if (callback) {
        return callback(error)
      } else {
        throw new Error(error)
      }
    }
  }

  if (callback) {
    twigTemplates[template].renderAsync(data)
      .then(result => callback(null, result.trim()))
      .catch(e => callback(new Error('Error rendering Twig template: ' + e.message)))
  } else {
    return twigTemplates[template].render(data).trim()
  }
}
