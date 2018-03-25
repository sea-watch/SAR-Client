import { Injectable } from '@angular/core';

import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

declare var md5: any;



import { AuthService } from '../services/auth.service';
import { LocationsService } from '../services/locations.service';
import { StatusesService } from '../services/statuses.service';
import { Case } from '../interfaces/case';
import { Location } from '../interfaces/location';
import { DBClientService } from '../services/db-client.service';
import { DBTxActions, DBTxReplyMessage } from '../interfaces/db-tx';

@Injectable()
export class CasesService {

  private dbClientService: DBClientService;
  data: Array<any>;
  filtered_statuses: Array<any>;

  remote;
  filteredStatusesSource = new Subject<Array<any>>();
  statuses;

  public filteredStatuses = new BehaviorSubject([]);
  constructor(dbclientService: DBClientService, private locationService: LocationsService, private authService: AuthService, private StatusesService: StatusesService) {
    this.dbClientService = dbclientService;
    this.filtered_statuses = [1, 2, 3, 4, 5];

    if (StatusesService.statuses)
      this.statuses = StatusesService.statuses;

  }

  store(currentCase: Case) {
    console.log(currentCase);
    currentCase.reportedBy = this.authService.getUserData().name;
    currentCase.lastUpdate = new Date().toISOString();
    // just to be safe check for undefined location
    if (currentCase.location) {
      currentCase.location.reportedBy = this.authService.getUserData().name;
      this.locationService.store(currentCase.location);
    }
    this.dbClientService.newTransaction(DBTxActions.CASES_STORE, {
      payload: this.getStorableForm(currentCase),
    }).then((msg: DBTxReplyMessage) => {
      console.log(msg);
      // stupid fix until https://github.com/sea-watch/SAR-Client/issues/95 is resolved
      // we just toggle a status that doesn't exist and the case list will be reloaded

      this.toggleStatusFilter('9');
    }).catch((error) => {
      console.log(error);
      // stupid fix until https://github.com/sea-watch/SAR-Client/issues/95 is resolved
      // we just toggle a status that doesn't exist and the case list will be reloaded

      this.toggleStatusFilter('9');
    });
  }

  getCases(): Promise<Array<Case>> {
    return new Promise((resolve, reject) => {
      this.dbClientService.newTransaction(DBTxActions.CASES_ALL)
        .then((msg: DBTxReplyMessage) => {
          const list: Array<Case> = msg.payload.rows.map(r => r.doc);
          resolve(list);
        }).catch(reject);
    });
  }

  getCase(id: string): Promise<Case> {
    return new Promise((resolve, reject) => {
      this.dbClientService.newTransaction(DBTxActions.CASES_GET, { id: id })
        .then((msg: DBTxReplyMessage) => {
          resolve(<Case>msg.payload);
        }).catch(reject);
    });
  }

  getCasesForStates(states: Array<string>): Promise<Array<Case>> {
    return new Promise((resolve, reject) => {
      this.dbClientService.newTransaction(DBTxActions.CASES_FIND, {
        selector: {
          state: { '$in': states },
        },
      }).then((msg: DBTxReplyMessage) => {
        resolve(msg.payload.docs.map((doc) => <Case>doc));
      }).catch(reject);
    });
  }

  /**
   * Converts this object into a storable without circular
   * dependencies.
   * Removes location
   */
  private getStorableForm(c: Case) {
    const selfCopy = Object.assign({}, c);
    delete selfCopy.location;
    return selfCopy;
  }
  toggleStatusFilter(status_id: string) {
    console.log(status_id);

    if (status_id === 'all') {
      if (this.filtered_statuses.length >= this.statuses.length) {
        this.filtered_statuses = [];
      } else {

        this.filtered_statuses = [];
        for (var i in this.statuses) {
          console.log(this.statuses);
          this.filtered_statuses.push(parseInt(i) + 1);
        }

      }
    } else {
      if (this.filtered_statuses.indexOf(status_id) === -1)
        this.filtered_statuses.push(status_id);
      else
        this.filtered_statuses.splice(this.filtered_statuses.indexOf(status_id), 1);
    }


    this.filteredStatuses.next(this.filtered_statuses);
  }
  getFilteredStatuses() {
    return this.filtered_statuses;
  }

  getCaseHash(case_id: string) {
    return md5(case_id).substr(0, 4).toUpperCase();
  }
}
