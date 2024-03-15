module.exports = {
  id: 'action-reload-style',
  appInit (app) {
    app.on('layer-selector-layer-actions', (div, leafletGeowikiLayer) => {
      const button = document.createElement('div')
      button.className = 'action'
      button.innerHTML = '<i class="fa-solid fa-rotate" title="Reload style file"></i>'
      div.appendChild(button)

      button.onclick = () => {
        app.styleLoader.clearCache(leafletGeowikiLayer.styleFile)
      }
    })
  }
}
