/**
 * This module is responsible on handling all the inter process communications
 * between the frontend to the electron backend.
 */

import { app, ipcMain } from 'electron';
import { environment } from '../../environments/environment';
import { openRepository } from '../services/app-services';
import { IsoRepository } from '../services/iso-repository';

export default class ElectronEvents {
	static bootstrapElectronEvents(): Electron.IpcMain {
		return ipcMain;
	}
}

// Retrieve app version
ipcMain.handle('get-app-version', () => {
	console.log(`Fetching application version... [v${environment.version}]`);

	return environment.version;
});

// Handle App termination
ipcMain.on('quit', (event, code) => {
	app.exit(code);
});

ipcMain.handle('get-log', async (_event, path: string) => {
	const repository = new IsoRepository(path);
	await repository.open();
	return repository.commits;
});

ipcMain.handle('open-repository', async () => {
	return openRepository();
});
