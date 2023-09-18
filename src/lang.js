import App from './App'

const modulekitLang = require('modulekit-lang')
App.addExtension({
  id: 'lang',
  requireExtensions: ['config'],
  initFun
})

function initFun (app, callback) {
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
