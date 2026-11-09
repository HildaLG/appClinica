import { Injectable } from '@angular/core';

import { WritableApiService } from '../api/writable-api.service';
import { Insurance, InsurancePayload } from '../models/insurance';

@Injectable({ providedIn: 'root' })
export class InsuranceService extends WritableApiService<Insurance, InsurancePayload> {
  protected readonly resource = 'insurance';
}
