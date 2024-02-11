let app

module.exports = {
  id: 'customStyles',
  appInit (_app) {
    app = _app

    app.on('style-get', (id, promises) => {
      const source = localStorage.getItem('style/' + id)
      
      if (!source) {
        return
      }

      promises.push(new Promise((resolve) => resolve(source)))
    })

    app.on('list-styles', (promises) => {
      promises.push(new Promise((resolve) => {
        const list = Object.keys(localStorage)
          .map(id => {
            const m = id.match(/^style\/(.*)$/)
            if (!m) { return null }

            const data = localStorage.getItem(id)
            return {
              id: m[1],
              name: m[1] + ' (edited)',
              data
            }
          })
          .filter(file => file)

        resolve(list)
      }))
    })
  },

  add (id, content) {
    localStorage.setItem('style/' + id, content)
    app.refresh()
  }
}
