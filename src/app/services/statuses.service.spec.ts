/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { StatusesService } from './statuses.service';

describe('StatusesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StatusesService]
    });
  });

  it('should ...', inject([StatusesService], (service: StatusesService) => {
    expect(service).toBeTruthy();
  }));
});
