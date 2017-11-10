import { Injectable } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { LocationsService } from '../services/locations.service';
import { Message } from '../models/message';
import { DBClientService } from '../services/db-client.service';
import { DBTxActions, DBTxReplyMessage } from '../interfaces/db-tx';
import { plainToClass } from "class-transformer";

@Injectable()
export class ChatService {

  private dbClientService: DBClientService;

  constructor(dbclientService: DBClientService, authService: AuthService) {
    this.dbClientService = dbclientService;
  }

  /**
   * Create a new Message instance with a certain text & author
   */
  newMessage(message: string, username: string) : Message {
    return plainToClass(Message, {
      _id: new Date().toISOString() + '-writtenBy-' + username,
      author: username,
      type: 'message',
      createdAt: new Date().toISOString(),
      text: message
    });
  }

  /**
   * Store a Message object to the database
   */
  store(currentMessage: Message): Promise<Message> {
    console.log('storing message', currentMessage);

    return new Promise((resolve, reject) => {
      this.dbClientService.newTransaction(DBTxActions.MESSAGES_STORE, {
        payload: this.getStorableForm(currentMessage),
      }).then((msg: DBTxReplyMessage) => {
        console.debug('successfully saved message');
        resolve(<Message>msg.payload);
      }).catch(reject);
    });
  }

  /**
   * Sort an array of messages by time
   */
  sortMessages(messages) {
    return messages.sort(
      (a, b) => {
        return a._id > b._id ? 1 : (a._id < b._id ? -1 : 0);
      }
    );
  }

  /**
   * Get all messages from the db
   */
  getMessages(): Promise<Array<Message>> {
    var self = this;
    return new Promise((resolve, reject) => {
      this.dbClientService.newTransaction(DBTxActions.MESSAGES_ALL)
        .then((msg: DBTxReplyMessage) => {

          var messages = msg.payload.rows.map(r => plainToClass(Message, r.doc));
          messages = self.sortMessages(messages);
          resolve(messages);
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
