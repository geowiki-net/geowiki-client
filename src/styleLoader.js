import StyleLoader from './StyleLoader'

module.exports = {
  id: 'styleLoader',
  requireModules: ['config'],
  appInit (app) {
    app.styleLoader = new StyleLoader(app)
  }
}
