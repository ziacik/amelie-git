import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class ElectronService {
	private electronCached: Electron.RendererInterface | undefined;

	private get electron(): Electron.RendererInterface | undefined {
		if (!this.electronCached) {
			this.electronCached = globalThis.require('electron');
		}
		return this.electronCached;
	}

	invoke<T>(channel: string, ...args: unknown[]): Observable<T> {
		return from(<Promise<T>>this.electron?.ipcRenderer.invoke(channel, ...args));
	}
}
