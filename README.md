# geowiki-viewer
View custom OSM files with a versatile style file in YAML format.

Example: ![Screenshot](./screenshot.png)

## Installation
### As standalone project
```sh
git clone https://github.com/geowiki-net/geowiki-viewer
cd geowiki-viewer
npm install
cp config.yaml-dist config.yaml # You might want to change parameters
npm start  # start built-in http server (you can use other web servers as well; no server process needed)
```

Browse to http://localhost:8080

## Usage
### Alternate .osm file
BY default, geowiki-viewer uses Overpass API for loading data. Alternatively, you could specify a file in OSM format as data soure:
* http://localhost:8080/#data=filename.osm

This would load `filename.osm` from the data/ directory.

### Alternate style file
Specify an alternate style file with the style parameter:
* http://localhost:8080/#styleFile=foobar.yaml

This would load `foobar.yaml` from the data/ directory.

## Example style.yaml
```yaml
layers:
- query: way[highway]
  feature:
    title: Road ({{ tags.highway }})
    style:
      color: black
      width: 5

- query: |
    (
    nwr[natural=wood];
    nwr[landuse=forest];
    )
  feature:
    style:
      fillColor: '#007f00'
```

## Additional features
### Panes
```yaml
panes:
  casing:
    zIndex: 399
    opacity: 0.5
  highlight:
    zIndex: 401
```

Add additional panes. Set style options as sub-object, including 'zIndex'.

## Extensions
There are a few extensions available. You can install them via npm, e.g. `npm
install geowiki-module-fullscreen`. You then have to enable it in the
'extensions.js' file and re-build your code with `npm run build`.

To create your own extension, use this code as skeleton:
```js
module.exports = {
  id: 'my-module-name',
  requireExtensions: [], // add the name of any extensions which should be loaded first, e.g. 'map'
  appInit: (app, callback) => {
    // will be executed if run inside GeowikiViewer (if defined). You can hook
    // to events with: app.on('init', () => { ... })
    callback()
  }
}
}
```

## Development
When developing, use the following command to automatically update the compiled JS file - with debugging information included:
```sh
npm run watch
```
