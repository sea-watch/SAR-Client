import { Injectable, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import uuid from 'uuid/v4';
import {
  DBTxActions,
  DBTxCallback,
  DBTxReplyMessage,
  DBTxRequestMessage,
  DBTxRequestArgs,
  DBReplicationChange
} from '../interfaces/db-tx';
import { Listener } from '../interfaces/listener';
import { ConfigService } from './config.service';
import { NetworkStateService } from './network-state.service';

// Use the globally defined dbWorker variable to be able to communicate
// with the PouchDB web worker.
declare const dbWorker: any;

@Injectable()
export class DBClientService {
  private dbWorker: Worker;
  private transactions: { [txid: string]: DBTxCallback };
  private changeListeners: { [dbName: string]: EventEmitter<DBReplicationChange>};

  constructor(private configService: ConfigService, private networkStateService: NetworkStateService) {
    this.transactions = {};
    this.changeListeners = {};
    this.dbWorker = dbWorker;

    this.dbWorker.onmessage = (msg) => this.dispatch(msg.data);

    this.initializeDatabases();
  }

  private initializeDatabases() {
    this.newTransaction(DBTxActions.DB_INIT, {
      remoteUrl: this.configService.getDBRemoteURL(),
    })
      .then((response) => console.log('Initialized databases'))
      .catch((error) => console.log('Error initializing databases', error));
  }

  private dispatch(msg: DBTxReplyMessage): void {
    switch (msg.type) {
      case 'change':
        this.dispatchChange(msg);
        break;
      default:
        this.dispatchReply(msg);
    }
  }

  private dispatchChange(msg: DBTxReplyMessage): void {
    const dbName = msg.payload.dbName;
    if (!dbName) {
      console.log('Could not emit DB change event, dbName missing', msg.payload);
      return;
    }
    if (!this.changeListeners[dbName]) {
      return;
    }
    if (!msg.payload.change) {
      console.log('Could not emit DB change event, change object is missing', msg.payload);
      return;
    }
    this.changeListeners[dbName].emit(<DBReplicationChange>msg.payload.change);
  }

  private dispatchReply(msg: DBTxReplyMessage): void {
    if (!this.transactions[msg.txid]) {
      console.log('No transaction for ID:', msg.txid);
      return;
    }

    this.transactions[msg.txid](msg);
    delete this.transactions[msg.txid];
  }

  public newTransaction(action: string, args: DBTxRequestArgs = {}): Promise<DBTxReplyMessage> {
    const txid = uuid();
    const request: DBTxRequestMessage = {
      txid: txid,
      action: action,
      args: args,
    };

    return new Promise((resolve, reject) => {
      this.transactions[txid] = (msg: DBTxReplyMessage) => resolve(msg);
      this.dbWorker.postMessage(request);
    });
  }

  public login(username: string, password: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.newTransaction(DBTxActions.SESSION_LOGIN, {
        username: username,
        password: password,
      }).then((response) => {
        if (response.type === 'error') {
          reject(response.error);
        } else {
          resolve(response.payload);
        }
      }).catch(reject);
    });
  }

  public getSession(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.newTransaction(DBTxActions.SESSION_GET)
        .then((response) => {
          if (response.type === 'error') {
            reject(response.error);
          } else {
            resolve(response.payload);
          }
        })
        .catch(reject);
    });
  }

  public clearAllDatabases(): Promise<DBTxReplyMessage> {
    return new Promise((resolve, reject) => {
      this.newTransaction(DBTxActions.DB_CLEAR_ALL)
        .then((response) => {
          if (response.type === 'error') {
            reject(response.error);
          } else {
            resolve(response.payload);
          }
        })
        .catch(reject);
    });
  }

  public addChangeListener(dbName: string, listener: Listener): Subscription {
    if (!this.changeListeners[dbName]) {
      this.changeListeners[dbName] = new EventEmitter<DBReplicationChange>();
    }
    return this.changeListeners[dbName].subscribe(listener.notify);
  }
}
