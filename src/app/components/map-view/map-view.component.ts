import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';

import { MapService } from 'app/services/map.service';
import { VehiclesService } from 'app/services/vehicles.service';
import { CasesService } from 'app/services/cases.service';
import { LocationsService } from '../../services/locations.service';

declare var L: any;
declare var map: any;
declare var map_inited: any;
@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.css'],
})
export class MapViewComponent implements OnInit, OnDestroy {
  public map: any;
  public map_inited: any;

  vehicles;
  cases;

  private runDrawTimer: boolean = false;
  private drawVehicleTimeout: any;

  constructor(
    private vehiclesService: VehiclesService,
    private casesService: CasesService,
    private locationsService: LocationsService,
    private mapService: MapService,
    private location: Location
  ) {

  }

  ngOnInit() {
    if (!map_inited)
      console.log(this.mapService.getMapObject());
    else
      this.initMap();

    this.runDrawTimer = true;
    // Update the vehicles on the map every 60 seconds
    this.drawVehicles().then(() => this.drawVehiclesWithTimer(60 * 1000));
    // TODO: Periodically render cases
    this.drawCases();
  }

  private drawVehiclesWithTimer(interval: number) {
    if (!this.runDrawTimer) {
      return;
    }
    // We are using setTimeout instead of setInterval to make sure the
    // next update is only scheduled after this one is done.
    // Using setInterval would schedule a new update even if the previous
    // one is not finished yet.
    this.drawVehicleTimeout = window.setTimeout(() => {
        console.log('drawing!!');
        this.drawVehicles().then(() => {
          this.drawVehiclesWithTimer(interval);
        }).catch(error => {
          console.log('Error drawing vehicles', error);
          this.drawVehiclesWithTimer(interval);
        });
    }, interval);
  }

  public isHidden() {
    const list = [''],
      route = this.location.path();

    return (list.indexOf(route) === -1);
  }

  // This will basically never be called because we only render this component
  // once during app startup. (See commit: 4fca17d7b62727d43e2518b72007af0d40345da9)
  // We still cancel the timer in here because we might destroy the component at
  // one point.
  ngOnDestroy() {
    this.runDrawTimer = false;
    if (this.drawVehicleTimeout) {
      clearTimeout(this.drawVehicleTimeout);
    }
  }

  drawCases() {
    this.casesService.getCases().then((data) => {
      this.cases = data;
      for (const incident of this.cases) {
        if (parseInt(incident.state) < 5) {
          const location_promise = this.locationsService.getLastLocationMatching(incident._id);
          location_promise.then((location) => {
            let location_doc = location;
            if (!location_doc || !location_doc.latitude) {
              console.log('No location found for case: ' + incident._id);
              return;
            }
            this.mapService.setMarker(
              incident._id,
              'cases',
              location_doc.latitude,
              location_doc.longitude,
              incident._id + ' at ' + location_doc.latitude + ' ' + location_doc.longitude,
            );
          });
        }
      }
    });
  }

  drawVehicles(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.vehiclesService.getVehicles().then((data) => {
        this.vehicles = data;
        const promises = [];

        for (const vehicle of this.vehicles) {
          const location_promise = this.locationsService.getLastLocationMatching(vehicle._id);
          location_promise.then((location) => {
            const location_doc = location;
            if (!location_doc || !location_doc.latitude) {
              console.log('No location found for vehicle: ' + vehicle.title);
              return;
            }
            const last_update = location_doc._id.substr(0, 19).replace('T', ' ');
            this.mapService.setMarker(
              vehicle._id,
              'vehicles',
              location_doc.latitude,
              location_doc.longitude,
              '<h5>' + vehicle.title + '</h5><b>' +
              // TODO: The latitude and longitude value can be strings or numbers
              //       This should be fixed to always be numbers!
              this.parseLatitude(parseFloat(<any>location_doc.latitude)) + ' ' +
              this.parseLongitude(parseFloat(<any>location_doc.longitude)) +
              '</b><br />' + last_update,

              vehicle.marker_color,
              vehicle._id
            );
          });

          promises.push(location_promise);
        }

        // We want to wait for all location updates to be finished before
        // moving on. Otherwise we might schedule a new update before this
        // one has finished.
        Promise.all(promises).then(resolve).catch(reject);
      });
    });
  }
  // the following is taken from stackoverflow user mckamey at
  // http://stackoverflow.com/questions/4504956/formatting-double-to-latitude-longitude-human-readable-format
  parseLatituteOrLongitude(value: number, direction: string) {
    value = Math.abs(value);

    const degrees = Math.trunc(value);

    value = (value - degrees) * 60;

    const minutes = Math.trunc(value);
    const seconds = Math.round((value - minutes) * 60 * 10) / 10;

    return degrees + '&deg; ' + minutes + '\'' + seconds + '\'\'' + direction;
  }

  parseLatitude(value: number) {
    const direction = value < 0 ? 'S' : 'N';
    return this.parseLatituteOrLongitude(value, direction);
  }

  parseLongitude(value: number) {
    const direction = value < 0 ? 'W' : 'E';
    return this.parseLatituteOrLongitude(value, direction);
  }

  initMap() {
    console.log('initMap');

    map_inited = true;
    this.mapService.initMap();
  }
}
