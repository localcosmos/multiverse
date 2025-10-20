import View from 'ol/View';
import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
// marker
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Icon, Style } from 'ol/style';
import { transform } from 'ol/proj';
import type MapBrowserEvent from 'ol/MapBrowserEvent';
import markerImage from '@/assets/images/mapmarker_red.png';

export default class WorldMap {
  map: Map;
  markerLayer: VectorLayer<VectorSource>;

  constructor (mapDiv: string, longitude: number, latitude:number, zoom: number) {
    const coords3857 = transform([longitude, latitude], 'EPSG:4326', 'EPSG:3857');

    this.map = new Map({
      target: mapDiv,
      moveTolerance: 5,
      layers: [

        new TileLayer({
          source: new OSM(),
        }),
      ],

      view: new View({
        zoom: zoom,
        center: [coords3857[0], coords3857[1]],
        constrainResolution: true,
        enableRotation: false,
      }),
    });

    this.markerLayer = new VectorLayer({
      source: new VectorSource(),
    });

    this.map.addLayer(this.markerLayer);
  }

  drawMarker (x:number, y:number, removePreviousMarker: boolean) {
    if (removePreviousMarker === true) {
      this.clearMarkerLayer();
    }

    const style = this.getMarkerIcon();
    const point = new Point([x, y]);

    const marker = new Feature(point);
    marker.setStyle(style);
    this.markerLayer.getSource()?.addFeature(marker);
  }

  getMarkerIcon () {
    const icon = new Icon({
      anchor: [0.5, 1],
      crossOrigin: 'anonymous',
      src: markerImage,
      size: [54, 80],
      scale: 0.5,
    });

    const style = new Style({
      image: icon,
    });

    return style;
  }

  clearMarkerLayer () {
    this.markerLayer.getSource()?.clear();
  }

  drawMarkerFromClickEvent (event: MapBrowserEvent, removePreviousMarker: boolean) {
    const coordinates = this.map.getCoordinateFromPixel(event.pixel);
    const x = coordinates[0];
    const y = coordinates[1];
    this.drawMarker(x, y, removePreviousMarker);
  }

  setCenter (longitude: number, latitude: number, zoom: number) {
    const xy: number[] = transform([longitude, latitude], 'EPSG:4326', 'EPSG:3857');

    this.map.getView().setCenter(xy);
    this.map.getView().setZoom(zoom);
  }
}
