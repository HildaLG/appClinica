import { Injectable } from '@angular/core';

import { WritableApiService } from '../api/writable-api.service';
import { Patient, PatientPayload, PatientUpdatePayload } from '../models/patient';

@Injectable({ providedIn: 'root' })
export class PatientService extends WritableApiService<Patient, PatientPayload, PatientUpdatePayload> {
  protected readonly resource = 'patient';
}
