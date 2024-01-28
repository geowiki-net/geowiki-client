module.exports = {
  id: 'listDataDirectory',
  appInit (app) {
    app.on('list-data-sources', promises => {
      promises.push(new Promise((resolve) => {
        listDirectory(app.config.dataDirectory, (err, list) => {
          if (err) { return resolve([]) } // ignore

          const result = list
            .map(id => {
              if (!id.match(/(\.osm|\.osm\.bz2|\.osm\.json)$/)) {
                return
              }

              return {
                id: id,
                url: id
              }
            })
            .filter(v => v)

          resolve(result)
        })
      }))
    })

    app.on('list-styles', promises => {
      promises.push(new Promise((resolve) => {
        listDirectory(app.config.dataDirectory, (err, list) => {
          if (err) { return resolve([]) } // ignore

          const result = list
            .map(id => {
              if (!id.match(/(\.yaml)$/)) {
                return
              }

              return {
                id: id,
                url: id
              }
            })
            .filter(v => v)

          resolve(result)
        })
      }))
    })
  }
}

let listing
let callbacks
function listDirectory (directory, callback) {
  if (listing) {
    return callback(null, listing)
  }

  if (callbacks) {
    return callbacks.push(callback)
  } else {
    callbacks = [callback]
  }

  fetch(directory)
    .then(req => {
      if (req.status !== 200) {
        return resolve([])
      }

      return req.text()
    })
    .then(body => {
      const lines = body.split(/\n/)
      listing = lines
        .map(line => {
          const m = line.match(/<a href="(.\/)?([^"]*)"/)
          if (m) {
            return m[2]
          }
        })
        .filter(v => v)

      callbacks.forEach(cb => cb(null, listing))
    })
}
