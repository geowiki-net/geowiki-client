module.exports = {
  id: 'actionRemoveLayer',
  appInit (app) {
    app.on('layer-selector-layer-actions', (div, leafletGeowikiLayer) => {
      const button = document.createElement('div')
      button.className = 'action'
      button.innerHTML = '<i class="fa-solid fa-trash-can" title="Remove layer"></i>'
      div.appendChild(button)

      button.onclick = () => {
        console.log(leafletGeowikiLayer)
        leafletGeowikiLayer.parameters
      }
    })
  }
}
