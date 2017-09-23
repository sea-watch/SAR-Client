import { Component, Injector, ViewChild, ViewContainerRef, OnInit } from '@angular/core';

import { ModalService } from 'app/services/modal.service';

@Component({
  selector: 'modal-placeholder',
  templateUrl: './modalplaceholder.component.html',
  styleUrls: ['./modalplaceholder.component.css']
})

export class ModalPlaceholderComponent implements OnInit {

  @ViewChild('modalplaceholder', { read: ViewContainerRef })
  viewContainerRef;

  constructor(
    private modalService: ModalService,
    private injector: Injector) {
  }

  ngOnInit(): void {
    this.modalService.registerViewContainerRef(this.viewContainerRef);
    this.modalService.registerInjector(this.injector);
  }

}
