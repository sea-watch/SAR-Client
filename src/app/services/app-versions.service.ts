import { Injectable } from '@angular/core';
import { DBClientService } from '../services/db-client.service';
import { DBTxActions, DBTxReplyMessage } from '../interfaces/db-tx';
import { AppVersion } from '../interfaces/app-version';

@Injectable()
export class AppVersionsService {
  private dbClientService: DBClientService;

  constructor(dbClientService: DBClientService) {
    this.dbClientService = dbClientService;
  }

  getVersions(): Promise<Array<AppVersion>> {
    return new Promise((resolve, reject) => {
      this.dbClientService.newTransaction(DBTxActions.VERSIONS_ALL)
        .then((msg: DBTxReplyMessage) => {
          resolve(msg.payload.rows.map(r => <AppVersion>r.doc));
        }).catch(reject);
    });
  }
}
