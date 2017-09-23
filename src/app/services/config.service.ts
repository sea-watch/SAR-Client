import { Injectable } from '@angular/core';
import appConfig from 'config/config';

// Use the globally defined remote object
declare var remote: any;

// Require the settings module via electron remote to use the same instance as the main
// electron process. See: https://github.com/nathanbuchar/electron-settings/wiki/FAQs
const electronSettings = remote.require('electron-settings');

@Injectable()
export class ConfigService {

  private result: Object;

  constructor() {
    // We have to initialize the settings on every app start to make sure new settings will be
    // written to the local storage
    this.initConfiguration();
  }

  initConfiguration() {
    for (const key in appConfig) {
      // Use hasOwnProperty here to avoid setting inherited properties and to please tslint
      if (appConfig.hasOwnProperty(key)) {
        // Do not overwrite existing settings
        if (!electronSettings.has(key)) {
          console.log(`Initialize setting: ${key}="${appConfig[key]}"`);
          electronSettings.set(key, appConfig[key]);
        }
      }
    }
  }

  getConfiguration(key) {
    return electronSettings.get(key);
  }

  getDBRemoteURL() {
    const url = this.getConfiguration('db_remote_url');

    // Remove all trailing "/" characters from the URL
    return url ? url.replace(/\/+$/, '') : null;
  }

  updateConfiguration(update, cb) {
    const updatedKeys = [];

    for (const key in update) {
      // Use hasOwnProperty here to avoid setting inherited properties and to please tslint
      if (update.hasOwnProperty(key)) {
        const prev = electronSettings.get(key);
        if (prev !== update[key]) {
          console.log(`Update setting ${key}=${update[key]}`);
          electronSettings.set(key, update[key]);
          updatedKeys.push(key);
        } else {
          console.log(`Not updating setting ${key} because it didn't change`);
        }
      }
    }

    // Execute callback after all settings have been updated
    if (cb) {
      cb(updatedKeys);
    }
  }
}
