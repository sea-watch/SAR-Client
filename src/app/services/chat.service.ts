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
  private loadedMessages: Array<Message> = []; // stores all currently loaded messages

  constructor(dbclientService: DBClientService, authService: AuthService) {
    this.dbClientService = dbclientService;
  }

  /**
   * Create a new Message instance with a certain text & author
   */
  newMessage(message: string, username: string): Message {
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
    var self = this;

    return new Promise((resolve, reject) => {
      this.dbClientService.newTransaction(DBTxActions.MESSAGES_STORE, {
        payload: this.getStorableForm(currentMessage),
      }).then((msg: DBTxReplyMessage) => {
        console.debug('successfully saved message', currentMessage);
        // on success, add the message to our list of loaded messages
        self.addMessages([currentMessage]);
        resolve(currentMessage);
      }).catch(reject);
    });
  }

  /**
   * Sort an array of messages by time
   */
  sortMessages(messages: Array<Message>): Array<Message> {
    return messages.sort(
      (a, b) => {
        return a._id > b._id ? 1 : (a._id < b._id ? -1 : 0);
      }
    );
  }

  /**
   * Add a list of messages to our list of loaded messages. Also remove
   * duplicates and sort them
   */
  addMessages(messages: Array<Message>) {
    this.loadedMessages = this
      .sortMessages(this.loadedMessages.concat(messages))
      // remove duplicate _ids, see https://stackoverflow.com/questions/2218999/remove-duplicates-from-an-array-of-objects-in-javascript
      .filter((message, index, self) =>
        index === self.findIndex((t) => (
          t._id === message._id
        ))
      );
  }

  /**
   * Load latest x messages from the db, optionally limited and starting from
   * a certain startkey
   */
  loadAdditionalMessages(limit: number = 10, startkey: string = null): Promise<Array<Message>> {
    var self = this;
    return new Promise((resolve, reject) => {
      this.dbClientService.newTransaction(DBTxActions.MESSAGES_ALL, { limit: limit, startkey: startkey })
        .then((msg: DBTxReplyMessage) => {

          // create Message models from the result and save them
          var messages = msg.payload.rows.map(r => plainToClass(Message, r.doc));
          self.addMessages(messages);

          resolve(messages);
        }).catch(reject);
    });
  }

  /**
   * Return all currently loaded messages
   */
  getLoadedMessages(): Array<Message> {
    return this.loadedMessages;
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
