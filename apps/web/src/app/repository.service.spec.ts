import { Branch, Commit, Person } from '@amelie-git/core';
import { wait } from '@amelie-git/testing';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ElectronService } from './electron.service';
import { RepositoryService } from './repository.service';

describe('RepositoryService', () => {
	let service: RepositoryService;
	let electronService: ElectronService;
	let commits: Commit[];
	let branches: Branch[];

	beforeEach(() => {
		jest.clearAllMocks();
		jest.resetAllMocks();
		jest.restoreAllMocks();
		commits = [
			new Commit('id', 'name', 'message', new Person('Amélie', 'amelie@mail'), new Person('Amélie', 'amelie@mail'), []),
		];
		branches = [new Branch('master'), new Branch('another')];
		TestBed.configureTestingModule({
			providers: [ElectronService],
		});
		service = TestBed.inject(RepositoryService);
		electronService = TestBed.inject(ElectronService);
		jest.spyOn(electronService, 'invoke').mockImplementation((channel, ...args) => {
			if (channel === 'get-log' && args[0] === '/path/to/repository') {
				return of(commits);
			}
			if (channel === 'get-branches' && args[0] === '/path/to/repository') {
				return of(branches);
			}
			return throwError(new Error('Some error'));
		});
	});

	afterEach(() => {
		TestBed.resetTestingModule();
	});

	describe('getLog', () => {
		it('will request a log from main process', async () => {
			let result = null;
			service.getLog('/path/to/repository').subscribe(
				(it) => (result = it),
				(it) => (result = it)
			);
			await wait();
			expect(result).toEqual(commits);
		});

		it('will fail when electron fails', async () => {
			let err = null;
			service.getLog('/unknown/path').subscribe(
				() => ({}),
				(e) => (err = e)
			);
			await wait();
			expect(err).toEqual(new Error('Some error'));
		});
	});

	describe('getBranches', () => {
		it('will request branches from main process', async () => {
			let result = null;
			service.getBranches('/path/to/repository').subscribe(
				(it) => (result = it),
				(it) => (result = it)
			);
			await wait();
			expect(result).toEqual(branches);
		});

		it('will fail when electron fails', async () => {
			let err = null;
			service.getBranches('/unknown/path').subscribe(
				() => ({}),
				(e) => (err = e)
			);
			await wait();
			expect(err).toEqual(new Error('Some error'));
		});
	});
});
