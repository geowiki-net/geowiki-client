const Twig = require('twig')

const twigTemplates = {}

module.exports = function twigGet (template, data, callback) {
  if (typeof template !== 'string') {
    return template
  }

  if (!(template in twigTemplates)) {
    try {
      twigTemplates[template] = Twig.twig({ data: template, rethrow: true })
    } catch (e) {
      console.error('Error compiling Twig template:', template, e.message)
      return ''
    }
  }

  if (callback) {
    twigTemplates[template].renderAsync(data)
      .then(result => callback(null, result.trim()))
  } else {
    return twigTemplates[template].render(data).trim()
  }
}
