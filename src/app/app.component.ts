import { Component, Input, Output } from '@angular/core';
import { AppModule } from './app.module';
import { VehiclesService } from 'app/services/vehicles.service';
import { ChatService } from 'app/services/chat.service';
import { ModalService } from 'app/services/modal.service';
import { SettingsComponent } from 'app/components/settings/settings.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [VehiclesService, ChatService]
})
export class AppComponent {
  title;
  logged_in;
  hideCreateCaseForm;
  windowOptions = { 'showstartoverlay': false };
  constructor(private vehiclesService: VehiclesService, private modalService: ModalService) {

    vehiclesService.getVehicles().then((vehicles) => console.log('VEHICLES', vehicles));
    this.title = 'SAR Client';

    this.windowOptions = { 'showstartoverlay': true };

    this.hideCreateCaseForm = true;

    this.showSettingsModal();
  }

  showSettingsModal() {
    this.modalService.create<SettingsComponent>(AppModule, SettingsComponent,
      {
      });
  }
}
