import DataSources from './DataSources'

module.exports = {
  id: 'dataSources',
  requireModules: ['config'],
  appInit (app) {
    app.dataSources = new DataSources(app)
  }
}
