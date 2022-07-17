import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class ElectronService {
	invoke<T>(channel: string, ...args: unknown[]): Observable<T> {
		return of(undefined as unknown as T);
	}
}
