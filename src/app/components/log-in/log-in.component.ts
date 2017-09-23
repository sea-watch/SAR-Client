import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'log-in-window',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.css'],
  providers: [AuthService]
})
export class LogInComponent implements OnInit {
  loginData = {};
  AuthService;
  logged_in: boolean;
  proceedOffline: boolean; //if true, login window disapears
  constructor(AuthService: AuthService) {
    this.logged_in = false;
    this.proceedOffline = false;
    this.AuthService = AuthService;

    AuthService.changeLoginState.subscribe(res => this.logged_in = res);
  }

  ngOnInit() {
  }

  hideLoginState() {
    return this.proceedOffline || this.logged_in;
  }

  doLogin() {
    console.log('login submitted...');
    this.AuthService.login(this.loginData);
  }
  proceed() {
    console.log('proceed offline...');
    console.log(this.hideLoginState());
    this.proceedOffline = true;
    console.log(this.hideLoginState());
  }

}
