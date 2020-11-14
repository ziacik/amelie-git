/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class ElectronService {
	private electronCached: any;

	private get electron(): any {
		if (!this.electronCached) {
			this.electronCached = (<any>window).require('electron');
		}
		return this.electronCached;
	}

	invoke<T extends any>(channel: string, ...args: any[]): Observable<T> {
		return from(<Promise<T>>this.electron.ipcRenderer.invoke(channel, ...args));
	}
}
