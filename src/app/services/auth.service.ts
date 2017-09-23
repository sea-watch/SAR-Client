import { Injectable, EventEmitter, Output } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Router } from '@angular/router';


import { ConfigService } from './config.service';
import { DBClientService } from '../services/db-client.service';
import { DBTxActions, DBTxReplyMessage } from '../interfaces/db-tx';

declare var localStorage: any;
declare var window: any;
declare var ipcRenderer: any;

@Injectable()
export class AuthService {
  logged_in;
  sessiondata; // used to store couch user object

  changeLoginState = new EventEmitter<boolean>();

  private dbClientService: DBClientService;
  ConfigService: ConfigService;

  constructor(dbClientService: DBClientService, ConfigService: ConfigService) {

    this.dbClientService = dbClientService;

    console.log('Initializing authentication');

    const self = this;
    self.changeLoginStateTo(false);

    console.log('Getting db session');
    this.dbClientService.getSession().then((response) => {
      if (!response.userCtx.name) {
        console.log('No existing session found');
        self.changeLoginStateTo(false);
      } else {
        // store returned sessiondata
        if (response.ok) {
          self.sessiondata = response.userCtx;
        }

        console.log('Session found', response.userCtx.name, response);
        self.changeLoginStateTo(true);
      }
    }).catch((error) => {
      console.log('Error getting session', error);
    });
  }

  changeLoginStateTo(loginState) {
    this.changeLoginState.emit(loginState);
  }

  // @param userdata {username:string, password:string}
  login(userdata) {
    const self = this;
    this.dbClientService.login(userdata.username, userdata.password)
      .then((response) => {
        console.log('Login successful', response);
        if (response.ok) {
          self.sessiondata = response;
        }

        // TODO: Why are we storing this? Is this supposed to be used as auto-login?
        localStorage.username = userdata.username;
        localStorage.password = userdata.password;
        self.changeLoginStateTo(true);

        // We reload the app to re-initialize the databases with a valid session
        setTimeout(() => {
          window.location = window.location.href + 'index.html';
        }, 1500);
      })
      .catch((error) => {
        console.log('Login error', error);
        if (error.name === 'unauthorized' || error.name === 'authentication_error') {
          alert(error.message);
        }
      });
  }

  logout() {
    this.changeLoginStateTo(false);
    ipcRenderer.send('logout-called');
  }

  is_logged_in() {
    return this.logged_in;
  }

  getUserData() {
    return this.sessiondata;
  }
}
