import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat.service';

import { AuthService } from '../../services/auth.service';
import { Message } from '../../models/message';

@Component({
  selector: 'chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  messages: Array<Message> = [];
  filtertype;
  chatmessage: string; // the current textarea value
  constructor(public chatService: ChatService, private authService: AuthService) {
    this.filtertype = 'all';
  }

  updateFilterType(type) {
    this.filtertype = type;
  }

  /**
   * Load x messages from the db, optionally scroll down afterwards
   */
  loadMessages(limit: number, scrollDown: boolean = false) {
    console.debug('loading ' + limit + ' more messages..');

    // if we already have some messages, start with the oldest one
    var startKey = null;
    if (this.messages.length > 0) {
      startKey = this.messages[0]._id;
      // because the "startKey" message is included, we need to increment the limit
      limit += 1;
    }
    this.chatService.loadAdditionalMessages(limit, startKey).then(messages => {
      this.updateMessageList(scrollDown);
    });
  }

  ngOnInit() {
    this.loadMessages(10, true);
  }

  /**
   * On key press in the textarea
   */
  keyDownFunction(event) {
    console.debug(event);

    // if enter without shift is pressed, send the message
    if (event.keyCode == 13 && !event.shiftKey) {
      event.preventDefault();
      this.submitMessage();
    }
  }

  /**
   * Create a new message from the current textarea value
   */
  submitMessage() {
    console.debug('try to send chat message: ', this.chatmessage);

    // if there is only whitespace or newlines, we do nothing
    if (this.chatmessage.match(/^(?:\r\n|\r|\n|\s)*$/g)) {
      console.log('Message is empty, ignoring');
      return false;
    }
    console.debug('message is ok, try to send', message);

    // create a new message model and save it
    var message = this.chatService.newMessage(this.chatmessage, this.authService.getUsername());
    const self = this;
    this.chatService.store(message).then(bla => {

      // after saving, empty the textarea and reload the message list
      self.chatmessage = '';
      self.updateMessageList(true);
    });
  }

  /**
   * Refresh the message list (e.g. refresh the display with the loaded messages)
   */
  updateMessageList(scrollDown: boolean = false){
    this.messages = this.chatService.getLoadedMessages();
    console.debug(this.messages);
    console.log('updated message list: ' + this.messages.length + ' messages');
    if (scrollDown) {
      this.scrollDown();
    }
  }

  /**
   * Scroll the chat window down to the bottom
   */
  scrollDown() {
    setTimeout(function() {
      const objDiv = document.getElementById('message_list');
      objDiv.scrollTop = objDiv.scrollHeight;
    }, 50);
  }

}
