import { Injectable } from '@angular/core';

import { WritableApiService } from '../api/writable-api.service';
import { Doctor, DoctorPayload } from '../models/doctor';

@Injectable({ providedIn: 'root' })
export class DoctorService extends WritableApiService<Doctor, DoctorPayload> {
  protected readonly resource = 'doctor';
}
