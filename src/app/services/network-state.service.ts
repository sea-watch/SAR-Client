import { Injectable, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';

declare const navigator: Navigator;
declare const window: Window;

class ConnectionStatus {
  static readonly ONLINE = 'online';
  static readonly OFFLINE = 'offline';
}

@Injectable()
export class NetworkStateService {
  private onlineState = new BehaviorSubject(navigator.onLine ? ConnectionStatus.ONLINE : ConnectionStatus.OFFLINE);

  constructor() {
    this.addConnectionStatusListener(value => console.log('CONNECTION STATUS:', value));

    window.addEventListener('online', this.setOnline.bind(this));
    window.addEventListener('offline', this.setOffline.bind(this));
  }

  public setOnline(): void {
    this.onlineState.next(ConnectionStatus.ONLINE);
  }

  public setOffline(): void {
    this.onlineState.next(ConnectionStatus.OFFLINE);
  }

  public addConnectionStatusListener(callback: (value) => void): Subscription {
    return this.onlineState.subscribe(callback);
  }
}
