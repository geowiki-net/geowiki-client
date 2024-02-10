```js
module.exports = {
  requireModules: ['mapLayers'],
  appInit (app) {
    app.mapLayers.layerTypes.group = (def) => {
      return L.layerGroup([], def.options)
    }
  }
}
```
