import { Injectable } from '@angular/core';
import { DBClientService } from '../services/db-client.service';
import { DBTxActions, DBTxReplyMessage } from '../interfaces/db-tx';
import { Vehicle } from '../interfaces/vehicle';

@Injectable()
export class VehiclesService {
  private dbClientService: DBClientService;

  constructor(dbclientService: DBClientService) {
    this.dbClientService = dbclientService;
  }

  getVehicles(): Promise<Array<Vehicle>> {
    return new Promise((resolve, reject) => {
      this.dbClientService.newTransaction(DBTxActions.VEHICLES_ALL)
        .then((msg: DBTxReplyMessage) => {
          const list: Array<Vehicle> = msg.payload.rows.map(r => r.doc);
          resolve(list);
        }).catch(reject);
    });
  }
}
