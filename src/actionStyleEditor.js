import yaml from 'js-yaml'
import md5 from 'md5'
import Window from 'modulekit-window'
import customStyles from './customStyles'

module.exports = {
  id: 'actionStyleEditor',
  requireModules: ['data', 'lang', customStyles],
  appInit
}

let textarea

function appInit (app) {
  app.on('layer-selector-layer-actions', (div, leafletGeowikiLayer) => {
    const button = document.createElement('div')
    button.className = 'action'
    button.innerHTML = '<i class="fa-solid fa-pen" title="Edit style file"></i>'
    div.appendChild(button)

    button.onclick = () => {
      new StyleEditor(app, leafletGeowikiLayer, 0)
    }
  })

  app.on('style-load', source => {
    if (!textarea) {
      return
    }

    textarea.value = source
  })
}

class StyleEditor {
  constructor (app, leafletGeowikiLayer, index) {
    this.app = app
    this.index = index
    this.leafletGeowikiLayer = leafletGeowikiLayer
    this.window = new Window({ title: 'Editor'})

    global.setTimeout(() => this.show(), 0)
  }

  show () {
    const form = document.createElement('form')
    form.className = 'styleEditor'
    form.onsubmit = () => {
      const id = md5(this.textarea.value)
      customStyles.add(id, this.textarea.value)
      const parameters = {...this.leafletGeowikiLayer.parameters}
      parameters.styleFile = id

      const layers = [...app.state.current.layers]
      layers[this.index] = parameters

      app.state.apply({ layers }, { update: 'push' })

      return false
    }

    this.textarea = document.createElement('textarea')
    form.appendChild(this.textarea)

    const submit = document.createElement('input')
    submit.type = 'submit'
    submit.value = 'Apply'
    form.appendChild(submit)

    this.app.styleLoader.get(this.leafletGeowikiLayer.parameters.styleFile)
      .then(def => {
        this.textarea.value = def.data
      })

    this.window.content.appendChild(form)
    this.window.show()
  }
}
