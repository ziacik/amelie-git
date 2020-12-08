import { wait } from '@amelie-git/testing';
import { TestBed } from '@angular/core/testing';
import { ElectronService } from './electron.service';

describe('ElectronService', () => {
	let service: ElectronService;
	let electron: unknown;
	let ipcRenderer: { invoke: jest.Mock };

	beforeEach(() => {
		ipcRenderer = {
			invoke: jest.fn(),
		};
		electron = {
			ipcRenderer,
		};
		(<unknown>window['require']) = (): unknown => electron;
		TestBed.configureTestingModule({});
		service = TestBed.inject(ElectronService);
	});

	it('can request data from main process', async () => {
		ipcRenderer.invoke.mockResolvedValue({ some: 'response' });
		let result = null;
		service
			.invoke<string>('some-channel', { some: 'argument' })
			.subscribe((it) => (result = it));
		await wait();
		expect(ipcRenderer.invoke).toHaveBeenCalledWith('some-channel', { some: 'argument' });
		expect(result).toEqual({ some: 'response' });
	});
});
