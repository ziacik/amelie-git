import { TestBed } from '@angular/core/testing';

import { IpcService } from './ipc.service';

const NeutralinoMock = {
	init: jest.fn(),
	os: {
		showFolderDialog: jest.fn(),
	},
};

describe('IpcService', () => {
	let service: IpcService;

	beforeEach(() => {
		(globalThis.Neutralino as unknown as typeof NeutralinoMock) = NeutralinoMock;
		TestBed.configureTestingModule({});
		service = TestBed.inject(IpcService);
	});

	it('service should be created and constructor should init the Neutralino', () => {
		expect(service).toBeTruthy();
		expect(Neutralino.init).toHaveBeenCalled();
	});

	it('openRepository opens a folder selection dialog and returns the selected one', async () => {
		(Neutralino.os.showFolderDialog as jest.Mock).mockResolvedValue('/selected/path');
		const expected = '/selected/path';
		const actual = await service.openRepository();
		expect(actual).toEqual(expected);
	});
});
