import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat.service';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  messages;
  data;
  filtertype;
  constructor(public chatService: ChatService, private authService: AuthService) {
    this.data = { messagetext: '' };
    this.filtertype = 'all';
  }

  updateFilterType(type) {
    this.filtertype = type;
  }

  ngOnInit() {
    this.chatService.getMessages().then(data => {
      this.messages = data.sort(
        (a, b) => {
          return a._id > b._id ? 1 : (a._id < b._id ? -1 : 0);
        });

      this.scrollDown();
    });
  }
  keyDownFunction(event) {

    console.log(event);
    if (event.keyCode == 13 && !event.shiftKey) {
      this.submitMessage();
    }
  }
  submitMessage() {
    this.data.messagetext = this.data.messagetext.replace(/\s+/g, ' ');
    console.log('message' + this.data.messagetext + 'message');
    if (this.data.messagetext == '' || this.data.messagetext == '\n' || this.data.messagetext == '\n\n')
      return false;

    const message = {
      _id: new Date().toISOString() + '-writtenBy-' + this.authService.getUserData().name,
      author: this.authService.getUserData().name,
      type: 'message',
      createdAt: new Date().toISOString(),
      text: this.data.messagetext
    };
    this.chatService.store(message);

    this.data.messagetext = '';

    this.scrollDown();

    console.log('message submitted:');
    console.log(message);

    return message;
  }
  scrollDown() {
    setTimeout(function() {
      const objDiv = document.getElementById('message_list');
      objDiv.scrollTop = objDiv.scrollHeight;
    }, 50);
  }

}
