import { TestBed, inject } from '@angular/core/testing';

import { DBClientService } from './db-client.service';

describe('DBClientService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DBClientService]
    });
  });

  it('should be created', inject([DBClientService], (service: DBClientService) => {
    expect(service).toBeTruthy();
  }));
});
