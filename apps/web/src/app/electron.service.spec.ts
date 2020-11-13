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
		(<unknown>window['require']) = () => electron;
		TestBed.configureTestingModule({});
		service = TestBed.inject(ElectronService);
	});

	it('can request data from main process', async () => {
		ipcRenderer.invoke.mockResolvedValue({ some: 'response' });
		const result = await service.invoke<string>('some-channel', { some: 'argument' });
		expect(ipcRenderer.invoke).toHaveBeenCalledWith('some-channel', { some: 'argument' });
		expect(result).toEqual({ some: 'response' });
	});
});
