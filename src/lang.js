const modulekitLang = require('modulekit-lang')

import App from './App'
App.addExtension({
  id: 'lang',
  requireExtensions: ['config'],
  initFun
})

let lang = null

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
