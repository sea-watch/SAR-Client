import { Component, OnInit } from '@angular/core';
import { DBClientService } from '../../services/db-client.service';
import { DBTxActions } from '../../interfaces/db-tx';
import { AppVersionsService } from '../../services/app-versions.service';

import { ConfigService } from '../../services/config.service';
import AppVersion from 'config/version';

import * as semver from 'semver';

declare var shell: any;
declare var os: any;
declare var helpers: any;

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  data;
  current_version;
  update_info;
  configService;
  platform;
  settings_info;
  db_remote_url;
  private appVersionsService: AppVersionsService;
  private dbClientService: DBClientService;

  constructor(appVersionsService: AppVersionsService, dbClientService: DBClientService, configService: ConfigService) {

    this.appVersionsService = appVersionsService;
    this.dbClientService = dbClientService;
    this.configService = configService;
    this.current_version = AppVersion.version;
    this.db_remote_url = this.configService.getConfiguration('db_remote_url');

    this.settings_info = {};
    this.settings_info.show = true;

    this.platform = os.platform();

    console.log('PLATFORM', this.platform);

    this.checkForUpdates();
  }

  ngOnInit() {

  }
  checkForUpdates() {

    this.update_info = {};
    this.update_info.status_obj = {};

    const self = this;

    this.appVersionsService.getVersions().then((versions) => {

      this.data = versions;

      if (this.data[0]) {
        const latest_version_obj = this.data[0]; const minimum_accepted_version = latest_version_obj.minimum_accepted_version;

        const latest_accepted_version = latest_version_obj._id;

        let download_link;
        let filesize;
        // get the right download link
        switch (self.platform) {
          case 'linux':
            download_link = latest_version_obj.download_links.linux.link;
            filesize = latest_version_obj.download_links.linux.filesize;
            break;
          case 'win32':
            download_link = latest_version_obj.download_links.win.link;
            filesize = latest_version_obj.download_links.win.filesize;
            break;
          case 'darwin':
            download_link = latest_version_obj.download_links.mac.link;
            filesize = latest_version_obj.download_links.mac.filesize;
            break;
        }

        // if current version of this client is lower than the minimum accepted version
        // update required
        if (semver.lt(this.current_version, minimum_accepted_version)) {
          // update required
          self.update_info.status_obj = {
            'status': 'update_required',
            'version': latest_version_obj._id,
            'link': download_link,
            'filesize': filesize
          };
          self.settings_info.show = true;
        }

        // update possible
        if (semver.lt(this.current_version, latest_accepted_version)) {
          self.update_info.status_obj = {
            'status': 'update_possible',
            'version': latest_version_obj._id,
            'link': download_link,
            'filesize': filesize
          };
          self.settings_info.show = true;
        }
      }
    }).catch((error) => {
      console.log(error);
    });

  }

  updateSettings() {

    const update = {
      db_remote_url: this.db_remote_url.replace(/\/?$/, '/'),
    };

    this.configService.updateConfiguration(update, (updatedKeys: Array<string>) => {
      const reload = () => {
        helpers.alert('Settings update successful!');
        helpers.reload();
      };

      // Do not clear databases if the DB URL didn't change
      if (updatedKeys.indexOf('db_remote_url') > -1) {
        console.log('DB URL changed, clearing databases');
        this.dbClientService.clearAllDatabases().then(() => {
          reload();
        }).catch((error) => {
          helpers.alert('Error clearing databases!');
        });
      } else {
        reload();
      }
    });

  }

  openExternal(link) {
    shell.openExternal(link);
  }
  closeSettings() {
    if (this.update_info.status_obj.status !== 'update_required')
      this.settings_info.show = false;
    else
      helpers.alert('You need to update before you can proceed!');
  }
}
