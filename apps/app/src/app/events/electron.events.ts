/**
 * This module is responsible on handling all the inter process communications
 * between the frontend to the electron backend.
 */

import { Commit, CommitFile } from '@amelie-git/core';
import { app, ipcMain } from 'electron';
import { environment } from '../../environments/environment';
import { openRepository } from '../services/app-services';
import { GitRepository } from '../services/git-repository';

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

// todo should not always create Repository
ipcMain.handle('get-log', async (_event, path: string) => {
	const repository = new GitRepository(path);
	await repository.open();
	return repository.commits;
});

ipcMain.handle('get-branches', async (_event, path: string) => {
	const repository = new GitRepository(path);
	await repository.open();
	return repository.branches;
});

ipcMain.handle('open-repository', async () => {
	return openRepository();
});

ipcMain.handle('get-commit-files', async (_event, path: string, commit: Commit) => {
	const repository = new GitRepository(path);
	await repository.open();
	return repository.getCommitFiles(commit);
});

ipcMain.handle('get-diff', async (_event, path: string, fileA: CommitFile, fileB: CommitFile) => {
	const repository = new GitRepository(path);
	await repository.open();
	return repository.getDiff(fileA, fileB);
});
