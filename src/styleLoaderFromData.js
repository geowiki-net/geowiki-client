module.exports = {
  id: 'styleLoaderfromData',
  requireModules: ['config'],
  appInit (app) {
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
  }
}

