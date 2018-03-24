import { Component, Input, Output, OnInit, OnDestroy, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';

import { AppComponent } from '../../app.component';
import { MapViewComponent } from '../map-view/map-view.component';

import { Case } from '../../interfaces/case';
import { Status } from '../../interfaces/status';
import { BoatType } from '../../interfaces/boat-type';
import { BoatCondition } from '../../interfaces/boat-condition';
import { Location } from '../../interfaces/location';
import { LocationType } from '../../interfaces/location-type';
import { Listener } from '../../interfaces/listener';
import { DBReplicationChange } from '../../interfaces/db-tx';

import { ModalContainer, Modal } from '../../interfaces/modalcontainer';
import { CasesService } from '../../services/cases.service';
import { LocationsService } from '../../services/locations.service';
import { AuthService } from '../../services/auth.service';
import { DBClientService } from '../../services/db-client.service';


@Component({
  selector: 'create-case-form',
  templateUrl: './create-case-form.component.html',
  styleUrls: ['./create-case-form.component.css'],
  providers: [FormBuilder, MapViewComponent]
})

@Modal()
export class CreateCaseFormComponent implements OnInit, OnDestroy, Listener {
  private submitted;
  hideCreateCaseForm;
  public createCaseForm: FormGroup;
  public events: any[] = []; // use later to display form changes
  public edited = false;

  case: Case;
  change: Case;

  @Input()
  caseId: string;

  state: Status;
  stateList: any;
  stateKeys: string[];

  boatType: BoatType;
  boatTypeList: any;
  boatTypeKeys: string[];

  boatCondition: BoatCondition;
  boatConditionList: any;
  boatConditionKeys: string[];
  casemeta: any;
  private dbChangeSubscription: Subscription;

  constructor(
    private _fb: FormBuilder,
    private caseService: CasesService,
    private locationService: LocationsService,
    private authService: AuthService,
    private dbClientService: DBClientService,
    private mapView: MapViewComponent) {

    this.hideCreateCaseForm = false;
    this.casemeta = {
      location_type: 'DD',
      dms_location: {
        latitude: { degree: 0, minute: 0, second: 0, direction: 'N' },
        longitude: { degree: 0, minute: 0, second: 0, direction: 'E' }
      },
      dd_location: {
        latitude: 0,
        longitude: 0
      },
      show_mrcc_part: false
    };

    this.stateList = Status;
    this.stateKeys = Object.keys(this.stateList).filter(Number);

    this.boatTypeList = BoatType;
    this.boatTypeKeys = Object.keys(this.boatTypeList).filter(Number);

    this.boatConditionList = BoatCondition;
    this.boatConditionKeys = Object.keys(this.boatConditionList).filter(Number);


    // typecast needed because we only have the id at this moment and we don't want
    // to explicitly initialize all the other fields
    this.case = <Case>{
      _id: new Date().toISOString() + '-reportedBy-' + authService.getUserData().name,
      createdAt: new Date().toISOString(),
      lastUpdate: new Date().toISOString()
    };
  } // form builder simplify form initialization

  ngOnInit() {
    this.dbChangeSubscription = this.dbClientService.addChangeListener('cases', this);

    // we will initialize our form model here
    // if caseId is present from input load it from the database
    const self = this;

    if (this.caseId) {

      this.caseService.getCase(this.caseId).then(function(c) {
        self.case = <Case>c;

        self.locationService.getLastLocationMatching(self.caseId).then(function(loc) {
          console.log(loc);

          self.case.location = <Location>loc;
          self.casemeta.dd_location.longitude = self.case.location.longitude;
          self.casemeta.dd_location.latitude = self.case.location.latitude;

          self.updateLocationType('DMS');
          self.updateLocationType('DD');

        });

      });
    } else {
      this.case.location = {
        _id: new Date().toISOString() + '-reportedBy-' + self.authService.getUserData().name,
        longitude: 0,
        latitude: 0,
        heading: 0,
        timestamp: 0,
        itemId: self.case._id,
        type: LocationType.Case
      };
    }
  }

  ngOnDestroy() {
    this.dbChangeSubscription.unsubscribe();
  }

  notify(change: DBReplicationChange): void {
    console.log('CHANGE');
    console.log(change);
    change.docs.forEach((c) => {
      console.log(c);

      if (c._id === this.case._id) {
        this.change = c;
        this.edited = true;
      }
    });
  }

  save() {
    this.submitted = true; // set form submit to true
    this.caseService.store(this.case);
    // ModalContainer.closeModal();
    this.hideCreateCaseForm = true;

    this.mapView.drawCases();
  }
  updatePosition() {
    this.updateLocationType(this.casemeta.location_type);
  }
  updateLocationType(type) {

    console.log(type);

    this.casemeta.location_type = type;
    console.log(type);
    switch (type) {

      case 'GMS':
        // convert lat
        if (!this.casemeta.dd_location) {
          this.casemeta.dd_location = {};
        }

        this.casemeta.dd_location.latitude = this.convertDMSToDD(this.casemeta.dms_location.latitude.degree, this.casemeta.dms_location.latitude.minute, this.casemeta.dms_location.latitude.second, this.casemeta.dms_location.latitude.direction);

        // convert lon
        this.casemeta.dd_location.longitude = this.convertDMSToDD(this.casemeta.dms_location.longitude.degree, this.casemeta.dms_location.longitude.minute, this.casemeta.dms_location.longitude.second, this.casemeta.dms_location.longitude.direction);


        console.log('HERE WE GO:');
        console.log(this.casemeta.dms_location);
        console.log(this.casemeta.dd_location);

        break;
      case 'DD':

        if (!this.casemeta.dd_location) {
          this.casemeta.dd_location = {};
        }
        if (!this.casemeta.dms_location) {
          this.casemeta.dms_location = {};
        }
        // convert lon
        this.casemeta.dms_location.latitude = this.convertDDToDMS(this.casemeta.dd_location.latitude);

        this.casemeta.dms_location.longitude = this.convertDDToDMS(this.casemeta.dd_location.longitude);
        console.log(this.casemeta.dms_location.latitude);
        console.log(this.casemeta.dms_location.longitude);

        break;

    }
    this.case.location.latitude = this.casemeta.dd_location.latitude;
    this.case.location.longitude = this.casemeta.dd_location.longitude;

    console.log(this.case.location);
  }

  convertDDToDMS(deg) {
    let d = Math.floor(deg);
    const minfloat = (deg - d) * 60;
    let m = Math.floor(minfloat);
    const secfloat = (minfloat - m) * 60;
    let s = Math.round(secfloat);
    // After rounding, the seconds might become 60. These two
    // if-tests are not necessary if no rounding is done.
    if (s === 60) {
      m++;
      s = 0;
    }
    if (m === 60) {
      d++;
      m = 0;
    }
    return {
      degree: d,
      minute: m,
      second: s,
      direction: 'N'
    };
  }
  convertDMSToDD(degrees, minutes, seconds, direction) {
    let dd = degrees + minutes / 60 + seconds / (60 * 60);

    if (direction === 'S' || direction === 'W') {
      dd = dd * -1;
    }
    return dd;
  }
  refresh() {
    const self = this;

    this.case = this.change;
    this.locationService.getLastLocationMatching(this.caseId).then(function(loc) {
      console.log(loc);
      self.case.location = <Location>loc;

    });
    this.edited = false;
  }

  getCurrentPosition() {
    const self = this;
    navigator.geolocation.getCurrentPosition((position) => {
      // console.log(position);
      // @TODO add reporter from currently logged in user
      self.case.location = {
        _id: new Date().toISOString() + '-reportedBy-' + self.authService.getUserData().name,
        longitude: position.coords.longitude,
        latitude: position.coords.latitude,
        heading: position.coords.heading,
        timestamp: position.timestamp,
        itemId: self.case._id,
        type: LocationType.Case,
        reportedBy: self.authService.getUserData().name
      };
    });
  }
  sendReportToMRCC() {


    //check if all required fields are 

    var missing_fields = [];
    if (typeof this.case.positionOfFirstIndication == 'undefined' || this.case.positionOfFirstIndication.length === 0) {
      missing_fields.push('position of first indication');
    }
    if (typeof this.case.dateOfFirstIndication == 'undefined' || this.case.dateOfFirstIndication.length === 0) {
      missing_fields.push('date of first indication');
    }
    if (typeof this.case.positionOfTranshipment == 'undefined' || this.case.positionOfTranshipment.length === 0) {
      missing_fields.push('position of transhipment');
    }
    if (typeof this.case.dateOfTranshipment == 'undefined' || this.case.dateOfTranshipment.length === 0) {
      missing_fields.push('date of transhipment');
    }

    if (typeof this.case.sarAuthority == 'undefined' || this.case.sarAuthority.length === 0) {
      missing_fields.push('SAR Authority');
    }

    if (typeof this.case.boatAfterInterception == 'undefined' || this.case.boatAfterInterception.length === 0) {
      missing_fields.push('Boat after interception');
    }
    if (typeof this.case.boatType == 'undefined') {
      missing_fields.push('Boat Type');
    }
    if (typeof this.case.incidentDescription == 'undefined' || this.case.incidentDescription.length === 0) {
      missing_fields.push('Event description');
    }

    if (typeof this.case.peopleCount == 'undefined') {
      missing_fields.push('People Count');
    }
    if (typeof this.case.womenCount == 'undefined') {
      missing_fields.push('Women Count');
    }
    if (typeof this.case.childrenCount == 'undefined') {
      missing_fields.push('Children Count');
    }

    if (missing_fields.length > 0) {
      alert('there are fields missing:' + missing_fields.join(','));
    } else {

      //see docu/mrcc_reports.md

      //set report status to pending
      this.case.reportStatus = 'pending'
      this.caseService.store(this.case);
      alert('The report will be generated and send to the MRCC, this can take up to 20 Minutes.');
      this.hideCreateCaseForm = true;

    }

  }

  /*setStatus(statusId : string){
    this.case.state = this.stateList[statusId];
  }

  logItem(item) {
      console.log(item);
  }*/
}
