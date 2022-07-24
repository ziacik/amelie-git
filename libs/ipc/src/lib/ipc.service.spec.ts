import { Branch } from '@amelie-git/core';
import { TestBed } from '@angular/core/testing';
import { exec } from 'child_process';
import path = require('path');

import { IpcService } from './ipc.service';

const NeutralinoMock = {
	init: jest.fn(),
	os: {
		showFolderDialog: jest.fn().mockResolvedValue('/selected/path'),
		execCommand: async (command: string): Promise<Neutralino.os.ExecCommandResult> => {
			return new Promise((resolve) => {
				const commandFixedForFixture = command.replace('git ', 'git --git-dir=_git ');
				exec(commandFixedForFixture, (err, stdOut, stdErr) => {
					// Neutralino's execCommand resolves even if the executed command fails.
					resolve({ pid: 0, stdOut, stdErr, exitCode: err?.code ?? 0 });
				});
			});
		},
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
		const expected = '/selected/path';
		const actual = await service.openRepository();
		expect(actual).toEqual(expected);
	});

	it('getBranches requests a list of local branches and returns them', async () => {
		const expected = [new Branch('another'), new Branch('master')];
		const actual = await service.getBranches(path.resolve(__dirname, '../__fixtures__/repo'));
		expect(actual).toEqual(expected);
	});

	it('getBranches fails if git fails', async () => {
		await expect(service.getBranches(path.resolve(__dirname, '../__fixtures__'))).rejects.toThrow(
			`Git error: fatal: not a git repository: '_git'`
		);
	});
});
