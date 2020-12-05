import { dialog } from 'electron';
import App from '../app';

export async function openRepository(): Promise<string> {
	try {
		const result = await dialog.showOpenDialog(App.mainWindow, { properties: ['openDirectory'] });
		return result.canceled ? null : result.filePaths[0];
	} catch (err) {
		throw new Error(`Error trying to select repository: ${err.message}`); // todo stack trace
	}
}
