const Twig = require('twig')

const twigTemplates = {}

module.exports = function twigGet (template, data, callback) {
  if (typeof template !== 'string') {
    return template
  }

  if (!(template in twigTemplates)) {
    try {
      twigTemplates[template] = Twig.twig({ data: template, autoescape: true, rethrow: true })
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
