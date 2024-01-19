import App from './App'
import modulekitLang from 'modulekit-lang'

App.addExtension({
  id: 'lang',
  requireExtensions: ['config'],
  appInit
})

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
