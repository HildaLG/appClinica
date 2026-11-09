import { Injectable } from '@angular/core';

import { WritableApiService } from '../api/writable-api.service';
import { Appointment, AppointmentPayload } from '../models/appointment';

@Injectable({ providedIn: 'root' })
export class AppointmentService extends WritableApiService<Appointment, AppointmentPayload> {
  protected readonly resource = 'appointment';
}
