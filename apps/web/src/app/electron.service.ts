/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';

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

	async invoke<T extends any>(channel: string, ...args: any[]): Promise<T> {
		return this.electron.ipcRenderer.invoke(channel, ...args);
	}
}
