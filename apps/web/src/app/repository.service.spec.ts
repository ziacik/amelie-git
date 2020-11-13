import { TestBed } from '@angular/core/testing';
import { ElectronService } from './electron.service';

import { RepositoryService } from './repository.service';
import { Commit, Person } from '@amelie-git/core';

describe('RepositoryService', () => {
	let service: RepositoryService;
	let electronService: ElectronService;
	let commits: Commit[];

	beforeEach(() => {
		commits = [
			new Commit('id', 'name', 'message', new Person('Amélie', 'amelie@mail'), new Person('Amélie', 'amelie@mail')),
		];
		TestBed.configureTestingModule({
			providers: [ElectronService],
		});
		service = TestBed.inject(RepositoryService);
		electronService = TestBed.inject(ElectronService);
		jest.spyOn(electronService, 'invoke').mockImplementation(async (channel, ...args) => {
			if (channel === 'get-log' && args[0] === '/path/to/repository') {
				return commits;
			}
			throw new Error('Some error');
		});
	});

	describe('getLog', () => {
		it('will request a log from main process', async () => {
			const result = await service.getLog('/path/to/repository');
			expect(result).toEqual(commits);
		});

		it('will fail when electron fails', async () => {
			await expect(service.getLog('/unknown/path')).rejects.toThrowError('Some error');
		});
	});
});
