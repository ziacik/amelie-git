import { BrowserWindow, dialog } from 'electron';
import App from '../app';
import { openRepository } from './app-services';

jest.mock('electron', () => ({
	dialog: {
		showOpenDialog: jest.fn(),
	},
}));

// TODO inject stuff instead
jest.mock('../app', () => ({
	default: {
		mainWindow: ({ id: 'whatever' } as unknown) as BrowserWindow,
	},
}));

describe('app services', () => {
	describe('openRepository', () => {
		it('opens a folder select dialog and returns selected directory', async () => {
			(dialog.showOpenDialog as jest.Mock).mockResolvedValue({
				filePaths: ['/selected/path'],
			});
			await openRepository();
			expect(dialog.showOpenDialog).toHaveBeenCalledWith(App.mainWindow, {
				properties: ['openDirectory'],
			});
		});

		it('returns selected directory', async () => {
			(dialog.showOpenDialog as jest.Mock).mockResolvedValue({
				filePaths: ['/selected/path'],
			});
			const folder = await openRepository();
			expect(folder).toEqual('/selected/path');
		});

		it('returns null if it is canceled', async () => {
			(dialog.showOpenDialog as jest.Mock).mockResolvedValue({
				canceled: true,
				filePaths: ['/selected/path'],
			});
			const folder = await openRepository();
			expect(folder).toBeNull();
		});

		it('throws if dialog throws', async () => {
			(dialog.showOpenDialog as jest.Mock).mockRejectedValue(new Error('Some error'));
			await expect(openRepository()).rejects.toThrowError('Error trying to select repository: Some error');
		});
	});
});
