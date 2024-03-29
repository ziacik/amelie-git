import { Branch, Commit } from '@amelie-git/core';
import { TestBed } from '@angular/core/testing';
import { exec } from 'child_process';
import path = require('path');

import { IpcService } from './ipc.service';

const NeutralinoMock = {
	init: jest.fn(),
	os: {
		showFolderDialog: jest.fn().mockResolvedValue(path.resolve(__dirname, '../__fixtures__/repo')),
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

	describe('openRepository', () => {
		it('opens a folder selection dialog and returns the selected one', async () => {
			const expected = path.resolve(__dirname, '../__fixtures__/repo');
			const actual = await service.openRepository();
			expect(actual).toEqual(expected);
		});

		it('fails if the selected folder is not a git repo', async () => {
			NeutralinoMock.os.showFolderDialog.mockResolvedValue(path.resolve(__dirname, '../__fixtures__'));
			await expect(service.openRepository()).rejects.toThrow(`Git error: fatal: not a git repository: '_git'`);
		});
	});

	describe('getBranches', () => {
		it('requests a list of local branches and returns them', async () => {
			const expected = [new Branch('another'), new Branch('master')];
			const actual = await service.getBranches(path.resolve(__dirname, '../__fixtures__/repo'));
			expect(actual).toEqual(expected);
		});

		it('fails if git fails', async () => {
			await expect(service.getBranches(path.resolve(__dirname, '../__fixtures__'))).rejects.toThrow(
				`Git error: fatal: not a git repository: '_git'`
			);
		});
	});

	describe('getLog', () => {
		it('getLog requests a list of commits and returns them', async () => {
			const commits = await service.getLog(path.resolve(__dirname, '../__fixtures__/repo'));
			const commit1 = commits[commits.length - 1];
			const commit2 = commits[commits.length - 2];
			expect(commit1.id).toBe('61c4fef6f915862a51acf5395728954834652d4a');
			expect(commit1.name).toBe('initial commit');
			expect(commit1.message).toBe('Some description\nabout the initial commit');
			expect(commit1.author.name).toBe('František Žiačik');
			expect(commit1.author.email).toBe('ziacik@gmail.com');
			expect(commit1.committer.name).toBe('František Žiačik');
			expect(commit1.committer.email).toBe('ziacik@gmail.com');
			expect(commit1.parentIds).toEqual([]);
			expect(commit2.id).toBe('f2403434af146c2c5bf5150282b8fd50a4f6a7d9');
			expect(commit2.name).toBe('second');
			expect(commit2.message).toBeFalsy();
			expect(commit2.author.name).toBe('František Žiačik');
			expect(commit2.author.email).toBe('ziacik@gmail.com');
			expect(commit2.committer.name).toBe('František Žiačik');
			expect(commit2.committer.email).toBe('ziacik@gmail.com');
			expect(commit2.parentIds).toEqual(['61c4fef6f915862a51acf5395728954834652d4a']);
		});

		it('fails if git fails', async () => {
			await expect(service.getLog(path.resolve(__dirname, '../__fixtures__'))).rejects.toThrow(
				`Git error: fatal: not a git repository: '_git'`
			);
		});
	});

	describe('getCommitFiles', () => {
		let commits: Commit[];

		beforeEach(async () => {
			commits = await service.getLog(path.resolve(__dirname, '../__fixtures__/repo'));
		});

		it('will return files that are changed, new or deleted in a commit', async () => {
			const commitFiles = await service.getCommitFiles(
				path.resolve(__dirname, '../__fixtures__/repo'),
				commits[commits.length - 3]
			);
			expect(commitFiles.map((it) => it.path)).toEqual(['deleted.txt', 'modified.txt', 'new.txt']);
		});

		it('will return files that are changed, new or deleted in another commit', async () => {
			const commitFiles = await service.getCommitFiles(
				path.resolve(__dirname, '../__fixtures__/repo'),
				commits[commits.length - 2]
			);
			expect(commitFiles.map((it) => it.path)).toEqual(['deleted.txt', 'modified.txt', 'original.txt']);
		});

		it('will return files that are new in the initial commit', async () => {
			const commitFiles = await service.getCommitFiles(
				path.resolve(__dirname, '../__fixtures__/repo'),
				commits[commits.length - 1]
			);
			expect(commitFiles.map((it) => it.path)).toEqual(['initial.txt']);
		});

		it('will reference correct commit in the files returned', async () => {
			const commit = commits[commits.length - 2];
			const commitFiles = await service.getCommitFiles(path.resolve(__dirname, '../__fixtures__/repo'), commit);
			expect(commitFiles.map((it) => it.commit)).toEqual([commit, commit, commit]);
		});

		it('fails if git fails', async () => {
			await expect(service.getCommitFiles(path.resolve(__dirname, '../__fixtures__'), commits[0])).rejects.toThrow(
				`Git error: fatal: not a git repository: '_git'`
			);
		});
	});
});
