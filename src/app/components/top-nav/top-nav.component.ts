import { Component, OnInit, OnDestroy, ComponentRef } from '@angular/core';

import { AppModule } from '../../app.module';
import { CreateCaseFormComponent } from '../create-case-form/create-case-form.component';
import { CaseListComponent } from '../case-list/case-list.component';
import { ModalService } from '../../services/modal.service';
import { AuthService } from '../../services/auth.service';
import { NetworkStateService } from '../../services/network-state.service';
import { SettingsComponent } from 'app/components/settings/settings.component';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.css']
})

export class TopNavComponent implements OnInit, OnDestroy {
  title: string;
  is_online;
  show_sub_menu;
  private networkStatusSubscription: Subscription;

  constructor(
    private modalService: ModalService,
    private authService: AuthService,
    private networkStateService: NetworkStateService) {

    this.title = 'top nav';
    this.show_sub_menu = false;
  }

  ngOnInit() {
    this.networkStatusSubscription = this.networkStateService.addConnectionStatusListener(value => this.is_online = value);
  }

  ngOnDestroy() {
    this.networkStatusSubscription.unsubscribe();
  }

  logout() {
    console.log('logout called');
    window.localStorage.clear();
    this.authService.logout();
    console.log('logout worked...');
  }

  showCreateCaseModal() {
    this.modalService.create<CreateCaseFormComponent>(AppModule, CreateCaseFormComponent,
      {
      });
  }
  showSettingsModal() {
    this.modalService.create<SettingsComponent>(AppModule, SettingsComponent,
      {
      });
  }

}
