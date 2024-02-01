import modulekitLang from 'modulekit-lang'

module.exports = {
  id: 'lang',
  requireModules: ['config'],
  appInit
}

function appInit (app) {
  app.on('init', promises => {
    promises.push(new Promise((resolve, reject) => {
      modulekitLang.set(app.options.lang, {}, (err) => {
        err ? reject(err) : resolve()
      })
    }))
  })

  app.on('state-apply', state => {
    if (state.lang && state.lang !== app.options.lang) {
      modulekitLang.set(state.lang, {}, () => {
        app.options.lang = state.lang
        app.emit('lang-change')
      })
    }
  })
}
