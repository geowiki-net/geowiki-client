import modulekitLang from 'modulekit-lang'

module.exports = {
  id: 'lang',
  requireExtensions: ['config'],
  appInit
}

function appInit (app, callback) {
  modulekitLang.set(app.options.lang, {}, callback)

  app.on('state-apply', state => {
    if (state.lang && state.lang !== app.options.lang) {
      modulekitLang.set(state.lang, {}, () => {
        app.options.lang = state.lang
        app.emit('lang-change')
      })
    }
  })
}
