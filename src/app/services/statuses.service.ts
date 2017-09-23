import { Injectable } from '@angular/core';

@Injectable()
export class StatusesService {


  statuses;
  constructor() {

    this.statuses = [
      {
        index: 'need_help',
        title: 'Need Help'
      },
      {
        index: 'critical_target',
        title: 'Critical'
      },
      {
        index: 'possible_target',
        title: 'Possible Target'
      },
      {
        index: 'attended',
        title: 'Attended'
      },
      {
        index: 'rescued',
        title: 'Rescued'
      },
      {
        index: 'closed',
        title: 'Closed'
      }
    ];


  }

}
