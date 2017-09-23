import { Component, OnInit } from '@angular/core';

import { AppModule } from '../../app.module';

import { Case } from '../../interfaces/case';
import { BoatType } from '../../interfaces/boat-type';
import { BoatCondition } from '../../interfaces/boat-condition';
import { Status } from '../../interfaces/status';

import { CasesService } from '../../services/cases.service';
import { LocationsService } from '../../services/locations.service';
import { CreateCaseFormComponent } from '../create-case-form/create-case-form.component';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-case-list',
  templateUrl: './case-list.component.html',
  styleUrls: ['./case-list.component.css']
})

export class CaseListComponent implements OnInit {

  cases: Array<Case>;
  toggled_cases;
  states = Status;
  getCaseHash;
  boatTypes = BoatType;
  boatConditions = BoatCondition;
  caseMeta: any;

  JSON: any;
  constructor(public caseService: CasesService, public locationService: LocationsService, private modalService: ModalService) {
    this.JSON = JSON;
    this.caseMeta = { locations: {} };

    this.getCaseHash = caseService.getCaseHash;
  }

  ngOnInit() {

    this.toggled_cases = [];

    this.caseService.filteredStatuses.subscribe((data) => {

      console.log('filtered statuses subscription called for statuses:' + this.caseService.filtered_statuses);

      const matchingPromise = this.caseService.getCasesForStates(this.caseService.getFilteredStatuses().map(String));

      const self = this;
      matchingPromise.then(cases => {



        this.cases = cases.sort(
          (a, b) => {
            return a._id < b._id ? 1 : (a._id > b._id ? -1 : 0);
          });

        console.log(cases);

        const self = this;
        const initial_cases_length = this.cases.length;

        // loop through cases and load location
        self.loadLocationForCase();


      });


    });


  }

  loadLocationForCase() {
    const self = this;
    self.locationService.getAllLocations().then(
      function(locations) {
        console.log(locations);
        for (let x = 0; x < self.cases.length; x++) {
          if (self.cases[x] && self.cases[x]._id) {
            const doc = self.cases[x];
            self.caseMeta.locations[doc._id] = locations.filter(function(item) {
              return item.itemId === doc._id;
            })[0];
            console.log(self.caseMeta.locations[doc._id]);
          }
        }
      }
    );
  }

  getLocation(case_id: string) {
    if (this.caseMeta.locations[case_id] && this.caseMeta.locations[case_id]._id)
      return 'LAT: ' + this.caseMeta.locations[case_id].latitude + '<br>LON: ' + this.caseMeta.locations[case_id].longitude;
  }

  toggleCase(case_id: string) {
    if (this.toggled_cases.indexOf(case_id) === -1)
      this.toggled_cases.push(case_id);
    else
      this.toggled_cases.splice(this.toggled_cases.indexOf(case_id));
  }

  getStateName(state: number): string {
    return this.states[state];
  }

  getStateClassName(state: number): string {
    return state ? this.getStateName(state).replace(/ /g, '').toLowerCase() : '';
  }

  getBoatTypeName(type: number): string {
    return this.boatTypes[type];
  }

  getBoatConditionName(condition: number): string {
    return this.boatConditions[condition];
  }

  showEditCaseModal(id: string) {
    this.modalService.create<CreateCaseFormComponent>(AppModule, CreateCaseFormComponent,
      {
        caseId: id
      });
  }

}
