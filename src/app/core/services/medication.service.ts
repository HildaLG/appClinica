import { Injectable } from '@angular/core';

import { WritableApiService } from '../api/writable-api.service';
import { Medication, MedicationPayload } from '../models/medication';

@Injectable({ providedIn: 'root' })
export class MedicationService extends WritableApiService<Medication, MedicationPayload> {
  protected readonly resource = 'medication';
}
