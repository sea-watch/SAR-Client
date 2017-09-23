import { Injectable } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { LocationsService } from '../services/locations.service';
import { Message } from '../interfaces/message';
import { DBClientService } from '../services/db-client.service';
import { DBTxActions, DBTxReplyMessage } from '../interfaces/db-tx';

@Injectable()
export class ChatService {

  private dbClientService: DBClientService;

  constructor(dbclientService: DBClientService, authService: AuthService) {
    this.dbClientService = dbclientService;
  }

  store(currentMessage: Message): Promise<Message> {
    console.log(currentMessage);
    currentMessage.createdAt = new Date().toISOString();

    return new Promise((resolve, reject) => {
      this.dbClientService.newTransaction(DBTxActions.MESSAGES_STORE, {
        payload: this.getStorableForm(currentMessage),
      }).then((msg: DBTxReplyMessage) => {
        resolve(<Message>msg.payload);
      }).catch(reject);
    });
  }

  getMessages(): Promise<Array<Message>> {
    return new Promise((resolve, reject) => {
      this.dbClientService.newTransaction(DBTxActions.MESSAGES_ALL)
        .then((msg: DBTxReplyMessage) => {
          resolve(msg.payload.rows.map(r => <Message>r.doc));
        }).catch(reject);
    });
  }

  /**
   * Converts this object into a storable without circular
   * dependencies.
   * Removes location
   */
  private getStorableForm(c: Message) {
    const selfCopy = Object.assign({}, c);
    return selfCopy;
  }
}
