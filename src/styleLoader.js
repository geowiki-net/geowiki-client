import App from './App'

App.addExtension({
  id: 'styleLoader',
  requireExtensions: ['config'],
  initFun
})

let app
const styles = {}

function initFun (_app, callback) {
  app = _app
  app.on('style-get', (style, promises) => {
    if (style.match(/(.+)\.yaml$/)) {
      promises.push(new Promise((resolve, reject) => {
        fetch(app.config.dataDirectory + '/' + style)
          .then(req => {
            if (req.ok) {
              return req.text()
            }

            throw (new Error("Can't load file " + style + ': ' + req.statusText))
          })
          .then(body => resolve(body))
          .catch(err => reject(err))
      }))
    }
  })

  callback()
}

module.exports = {
  get (style) {
    return new Promise((resolve, reject) => {
      if (style in styles) {
        return resolve(styles[style])
      }

      const promises = []
      app.emit('style-get', style, promises)
      Promise.any(promises)
        .then(body => {
          styles[style] = body
          resolve(body)
        })
        .catch(err => {
          reject(err)
        })
    })
  }
}
