import App from './App'
App.addExtension({
  id: 'config',
  initFun
})

function initFun (app, callback) {
  console.log('init config')
  callback()
}
