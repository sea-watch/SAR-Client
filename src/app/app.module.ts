import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { TopNavComponent } from './components/top-nav/top-nav.component';
import { LeftNavComponent } from './components/left-nav/left-nav.component';
import { ChatComponent } from './components/chat/chat.component';
import { MapViewComponent } from './components/map-view/map-view.component';
import { LogInComponent } from './components/log-in/log-in.component';
import { CreateCaseFormComponent } from './components/create-case-form/create-case-form.component';

import { ConfigService } from './services/config.service';
import { DBClientService } from './services/db-client.service';
import { AppVersionsService } from './services/app-versions.service';
import { NetworkStateService } from './services/network-state.service';
import { AuthService } from './services/auth.service';
import { LocationsService } from './services/locations.service';
import { CasesService } from './services/cases.service';
import { ModalService } from './services/modal.service';
import { MapService } from 'app/services/map.service';

import { ModalPlaceholderComponent } from './components/modalplaceholder/modalplaceholder.component';
import { CaseListComponent } from './components/case-list/case-list.component';
import { StatusesService } from './services/statuses.service';
import { SettingsComponent } from './components/settings/settings.component';


@NgModule({
  declarations: [
    AppComponent,
    TopNavComponent,
    LeftNavComponent,
    ChatComponent,
    MapViewComponent,
    LogInComponent,
    CreateCaseFormComponent,
    ModalPlaceholderComponent,
    CaseListComponent,
    SettingsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot([
      {
        path: 'cases',
        component: CaseListComponent
      }
    ])
  ],
  providers: [
    AuthService,
    ConfigService,
    ModalService,
    LocationsService,
    CasesService,
    MapService,
    StatusesService,
    DBClientService,
    AppVersionsService,
    NetworkStateService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
