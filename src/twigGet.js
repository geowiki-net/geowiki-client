const Twig = require('twig')

const twigTemplates = {}

module.exports = function twigGet (template, data) {
  if (typeof template !== 'string') {
    return template
  }

  if (!(template in twigTemplates)) {
    twigTemplates[template] = Twig.twig({ data: template })
  }

  return twigTemplates[template].render(data)
}
