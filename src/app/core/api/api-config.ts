import { InjectionToken } from '@angular/core';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () =>
    window.location.hostname.endsWith('onrender.com')
      ? 'https://apiclinica-qta0.onrender.com/api'
      : `http://${window.location.hostname}:8000/api`,
});
