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

    console.debug('Getting db session');
    this.dbClientService.getSession().then((response) => {
      if (!response.userCtx.name) {
        console.debug('No existing session found');
        self.changeLoginStateTo(false);

        // try autologin. FIXME is this a good place?
        self.autologin();
      } else {
        // store returned sessiondata
        if (response.ok) {
          self.sessiondata = response.userCtx;
        }

        console.debug('Session found', response.userCtx.name, response);
        self.changeLoginStateTo(true);
      }
    }).catch((error) => {
      console.warn('Error getting session', error);
    });
  }

  changeLoginStateTo(loginState) {
    console.debug('changing loginstate', loginState);
    this.changeLoginState.emit(loginState);
  }

  /**
   * Do the actual login, e.g. validate username and password and save the
   * session on success
   */
  doLogin(username: string, password: string) {
    const self = this;
    return this.dbClientService.login(username, password)
      .then((response) => {
        console.log('doLogin success:', response);
        if (response.ok) {
          self.sessiondata = response;
        }

        self.changeLoginStateTo(true);

        return response;
      })
      .catch((error) => {
        // log error and bubble it up
        console.error('Login error:' + error);
        throw error;
      })
      ;
  }

  /**
   * Login as called from the login form.
   *
   * @param userdata {username:string, password:string}
   */
  login(userdata) {
    const self = this;
    console.debug("login called");
    this.doLogin(userdata.username, userdata.password)
      .then((response) => {

        // if autologin is checked, save credentials, otherwise clear them
        if (userdata.autologin) {
          this.saveLoginData(userdata.username, userdata.password);
        } else {
          this.deleteLoginData();
        }

        // We reload the app to re-initialize the databases with a valid session
        setTimeout(() => {
          window.location = window.location.href + 'index.html';
        }, 1500);
      })
      .catch((error) => {
        if (error.name === 'unauthorized' || error.name === 'authentication_error') {
          alert(error.message);
        }
      });
  }

  /**
   * Save autologin data
   */
  saveLoginData(username: string, password: string) {
    // TODO is it ok to save the plaintext password in localstorage?
    localStorage.autoLoginUsername = username;
    localStorage.autoLoginPassword = password;
    console.log('saved login data to localStorage', username);
  }

  /**
   * Delete any autologin data
   */
  deleteLoginData() {
    delete localStorage.autoLoginUsername;
    delete localStorage.autoLoginPassword;
    console.log('deleted localStorage');
  }

  /**
   * Return autologin data
   */
  getLoginData() {
    return {
      username: localStorage.autoLoginUsername,
      password: localStorage.autoLoginPassword
    }
  }

  /**
   * Check if there is any autologin data and try to login
   */
  autologin() {
    const self = this;
    console.log('trying autologin..');

    var data = this.getLoginData();

    if (!data.username || !data.password) {
      console.log('no saved credentials, autologin not possible');
      return false;
    }

    this.doLogin(data.username, data.password)
      .then((response) => {
        console.log('autologin success');
      })
      .catch((error) => {
        console.warn('autologin failed, deleting saved credentials');
        self.deleteLoginData();
      });
  }

  logout() {
    // a logout removes any autologin
    this.deleteLoginData();
    this.changeLoginStateTo(false);
    ipcRenderer.send('logout-called');
  }

  is_logged_in() {
    return this.logged_in;
  }

  getUserData() {
    return this.sessiondata;
  }

  /**
   * Get the current username, or null if logged out
   */
  getUsername() {
    return this.sessiondata ? this.sessiondata.name : null;
  }
}
