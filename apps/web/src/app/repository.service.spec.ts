import { Branch, Commit, CommitFile, NULL_PERSON, Person } from '@amelie-git/core';
import { IpcService } from '@amelie-git/ipc';
import { TestBed } from '@angular/core/testing';
import { lastValueFrom } from 'rxjs';
import { RepositoryService } from './repository.service';

describe('RepositoryService', () => {
	let service: RepositoryService;
	let ipcService: IpcService;
	let commits: Commit[];
	let branches: Branch[];
	let commitFiles: CommitFile[];

	beforeEach(() => {
		commits = [
			new Commit('id', 'name', 'message', new Person('Amélie', 'amelie@mail'), new Person('Amélie', 'amelie@mail'), []),
		];
		branches = [new Branch('master'), new Branch('another')];
		commitFiles = [new CommitFile(commits[0], '/some/path')];
		TestBed.configureTestingModule({
			providers: [IpcService],
		});
		service = TestBed.inject(RepositoryService);
		ipcService = TestBed.inject(IpcService);

		jest.spyOn(ipcService, 'getLog').mockImplementation(async (path: string) => {
			if (path === '/path/to/repository') {
				return commits;
			} else {
				throw new Error('Some error');
			}
		});
		jest.spyOn(ipcService, 'getBranches').mockImplementation(async (path: string) => {
			if (path === '/path/to/repository') {
				return branches;
			} else {
				throw new Error('Some error');
			}
		});
		jest.spyOn(ipcService, 'getCommitFiles').mockImplementation(async (path: string) => {
			if (path === '/path/to/repository') {
				return commitFiles;
			} else {
				throw new Error('Some error');
			}
		});
	});

	afterEach(() => {
		TestBed.resetTestingModule();
	});

	describe('getLog', () => {
		it('will request a log from ipc', async () => {
			await expect(lastValueFrom(service.getLog('/path/to/repository'))).resolves.toEqual(commits);
		});

		it('will fail when ipc fails', async () => {
			await expect(lastValueFrom(service.getLog('/unknown/path'))).rejects.toEqual(new Error('Some error'));
		});
	});

	describe('getBranches', () => {
		it('will request branches from ipc', async () => {
			const result = await lastValueFrom(service.getBranches('/path/to/repository'));
			expect(result).toEqual(branches);
		});

		it('will fail when ipc fails', async () => {
			await expect(lastValueFrom(service.getBranches('/unknown/path'))).rejects.toEqual(new Error('Some error'));
		});
	});

	describe('getCommitFiles', () => {
		it('will request a list of commit files from main process', async () => {
			const commit = new Commit('commit-id', '', '', NULL_PERSON, NULL_PERSON, []);
			const result = await lastValueFrom(service.getCommitFiles('/path/to/repository', commit));
			expect(result).toEqual(commitFiles);
		});

		it('will fail when electron fails', async () => {
			const commit = new Commit('commit-id', '', '', NULL_PERSON, NULL_PERSON, []);
			await expect(lastValueFrom(service.getCommitFiles('/unknown/path', commit))).rejects.toEqual(
				new Error('Some error')
			);
		});
	});
});
