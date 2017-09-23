import { Injectable } from '@angular/core';
declare var L: any;
@Injectable()
export class MapService {
  map;
  startLocation;
  mapContainerId;
  maptype;
  markers = {};
  layer_groups;

  constructor() {
    this.maptype = 'OSM';
    // Make sure to add new layer groups here before using them in setMarker()
    this.layer_groups = {
      'vehicles': L.layerGroup(),
      'cases': L.layerGroup(),
    };
  }

  getMapObject() {
    if (!this.map) {
      return this.initMap();
    }
    return this.map;
  }

  getLayerGroup(group_name: string) {
    if (!(group_name in this.layer_groups)) {
      console.log(`ERROR: Layer group <${group_name}> does not exist`);
      return;
    }
    return this.layer_groups[group_name];
  }

  centerMap(latitude: number, longitude: number) {
    this.getMapObject().panTo([latitude, longitude]);
  }

  setMarker(id: string, group: string, x: number, y: number, description?: string, color?: string, title?: string) {
    const layer_group = this.getLayerGroup(group);
    var title_html = '';
    // remove potential old marker
    if (id in this.markers) {
      layer_group.removeLayer(this.markers[id]);
    }

    if (!title)
      title = '';
    if (!color)
      color = '#583470';
    const markerHtmlStyles = 'background-color: ' + color;


    if (title) {
      title_html = '<span>' + title + '</span>';
    }

    const icon = L.divIcon({
      iconAnchor: [0, 24],
      labelAnchor: [-6, 0],
      popupAnchor: [0, -36],
      html: '<div style="' + markerHtmlStyles + '" class="onefleet_marker">' + title_html + '</div>'
    });

    /*const marker = L.marker([x, y]).addTo(layer_group);*/

    const marker = L.marker([x, y], { icon: icon }).addTo(layer_group);

    if (description) {
      marker.bindPopup(description);
    }
    this.markers[id] = marker;
    return marker;
  }

  filter_on_cases(cases) {
    const group = this.getLayerGroup('cases');
    const case_markers = group.getLayers();
    console.log(case_markers);
  }


  initMap() {
    // init leaflet
    this.mapContainerId = 'client_map_container';
    this.startLocation = [32.46, 16.87];
    this.maptype = 'offline-map';

    this.map = L.map(this.mapContainerId, '');
    this.map.options.maxZoom = 8;
    this.map.setView(this.startLocation, 7);
    L.control.scale({ 'imperial': false }).addTo(this.map);
    switch (this.maptype) {
      case 'offline-map':
        /*Not working until maptiles are added to the repo*/
        L.tileLayer('MapQuest/{z}/{x}/{y}.png', {
          attributionControl: false
        }).addTo(this.map);
        break;
      case 'osm':
        L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this.map);
        break;
    }

    // Add the pre-defined layer groups to the map
    for (const name in this.layer_groups) {
      this.layer_groups[name].addTo(this.map);
    }

    // Add the control for the layer groups to the map
    L.control.layers({}, this.layer_groups).addTo(this.map);

    return this.map;
  }
}
