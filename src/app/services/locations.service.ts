import { Injectable } from '@angular/core';
import { DBClientService } from '../services/db-client.service';
import { DBTxActions, DBTxReplyMessage } from '../interfaces/db-tx';
import { Location } from '../interfaces/location';

@Injectable()
export class LocationsService {
  dbClientService: DBClientService;

  constructor(dbclientService: DBClientService) {
    this.dbClientService = dbclientService;
  }

  getLocation(id: string): Promise<Location> {
    console.log('getting location with id:', id);

    return new Promise((resolve, reject) => {
      this.dbClientService.newTransaction(DBTxActions.LOCATIONS_GET, { id: id })
        .then((msg: DBTxReplyMessage) => {
          const location: Location = msg.payload;
          resolve(location);
        }).catch(error => reject(error));
    });
  }

  getLastLocationMatching(foreignKey: string): Promise<Location> {
    return new Promise((resolve, reject) => {
      this.dbClientService.newTransaction(DBTxActions.LOCATIONS_FIND_ITEM, {
        item: foreignKey,
      }).then((msg: DBTxReplyMessage) => {
        const location: Location = msg.payload.docs[0];
        resolve(location);
      }).catch(error => reject(error));
    });
  }

  getAllLocations(): Promise<Array<Location>> {
    console.log('ERROR: locations#get-all not implemented', location);

    return new Promise((_, reject) => {
      reject(new Error('Getting all locations not implemented'));
    });
  }

  store(location: Location) {
    console.log('ERROR: locations#store not implemented', location);

    this.dbClientService.newTransaction(DBTxActions.LOCATIONS_STORE, {
      payload: location,
    }).then((msg: DBTxReplyMessage) => {
      console.log(msg);
    }).catch((error) => {
      console.log(error);
    });
  }
}
