import { Component, OnInit } from '@angular/core';

import { VehiclesService } from 'app/services/vehicles.service';
import { StatusesService } from 'app/services/statuses.service';
import { MapService } from 'app/services/map.service';
import { CasesService } from '../../services/cases.service';

import { Status } from '../../interfaces/status';
import { LocationsService } from '../../services/locations.service';


@Component({
  selector: 'left-nav',
  templateUrl: './left-nav.component.html',
  styleUrls: ['./left-nav.component.css'],
})
export class LeftNavComponent implements OnInit {
  vehicles;
  statuses;
  filtered_statuses;
  states = Status;
  constructor(
    private vehiclesService: VehiclesService,
    private statusesService: StatusesService,
    private mapService: MapService,
    private casesService: CasesService,
    private locationsService: LocationsService,
  ) {
    this.statuses = statusesService.statuses;
  }

  ngOnInit() {
    this.vehiclesService.getVehicles().then((data) => {
      this.vehicles = data;
    });
  }
  getStatusFilters() {
    return this.casesService.getFilteredStatuses();
  }
  getStatusClasses(status_index) {
    return this.states[status_index] + ' ' + ((this.casesService.getFilteredStatuses().indexOf(status_index) > -1) ? 'active' : '');
  }

  go_to_vehicle(vehicle: any) {
    const location_promise = this.locationsService.getLastLocationMatching(vehicle._id);
    location_promise.then((location) => {
      const location_doc = location;
      if (!location_doc || !location_doc.latitude) {
        console.log('No location found for vehicle: ' + vehicle.title);
        return;
      }
      this.mapService.centerMap(location_doc.latitude, location_doc.longitude);
    });
  }

  filter_by_status(status_id) {

    // add or remove status from filters
    this.casesService.toggleStatusFilter(status_id);

    console.log('showing cases with statusses ' + JSON.stringify(this.casesService.getFilteredStatuses()));


    const matchingPromise = this.casesService.getCasesForStates(this.casesService.getFilteredStatuses().map(String));
    matchingPromise.then((data) => {
      console.log(data);
      this.mapService.filter_on_cases('wat');
    });
  }



}
