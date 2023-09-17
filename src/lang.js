const modulekitLang = require('modulekit-lang')

import App from './App'
App.addExtension({
  id: 'lang',
  requireExtensions: ['config'],
  initFun
})

let lang = null

function initFun (app, callback) {
  modulekitLang.set(app.config.lang, {}, callback)
}
