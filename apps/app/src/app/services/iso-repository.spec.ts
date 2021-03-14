import { Branch, CommitFile } from '@amelie-git/core';
import { resolve } from 'path';
import { IsoRepository } from './iso-repository';

describe('IsoRepository', () => {
	let repository: IsoRepository;
	let repoPath: string;

	beforeAll(() => {
		repoPath = resolve(__dirname, '../../__fixtures__/repo');
	});

	beforeEach(() => {
		repository = new IsoRepository(repoPath, '_git');
	});

	describe('open', () => {
		it('will use isomorphic-git to load the repository commits and adds them to the repository', async () => {
			await repository.open();
			const commits = repository.commits;
			const commit1 = commits[commits.length - 1];
			const commit2 = commits[commits.length - 2];
			expect(commit1.id).toBe('61c4fef6f915862a51acf5395728954834652d4a');
			expect(commit1.name).toBe('initial commit');
			expect(commit1.message).toBe('Some description'); // fixme "about the initial commit" is missing from the description
			expect(commit1.author.name).toBe('František Žiačik');
			expect(commit1.author.email).toBe('ziacik@gmail.com');
			expect(commit1.committer.name).toBe('František Žiačik');
			expect(commit1.committer.email).toBe('ziacik@gmail.com');
			expect(commit1.parentIds).toEqual([]);
			expect(commit2.id).toBe('f2403434af146c2c5bf5150282b8fd50a4f6a7d9');
			expect(commit2.name).toBe('second');
			// expect(commit2.message).toBeFalsy(); // fixme is "undefined" string
			expect(commit2.author.name).toBe('František Žiačik');
			expect(commit2.author.email).toBe('ziacik@gmail.com');
			expect(commit2.committer.name).toBe('František Žiačik');
			expect(commit2.committer.email).toBe('ziacik@gmail.com');
			expect(commit2.parentIds).toEqual(['61c4fef6f915862a51acf5395728954834652d4a']);
		});

		it('will use isomorphic-git to get the repository branches and adds them to the repository', async () => {
			await repository.open();
			expect(repository.branches).toEqual([new Branch('another'), new Branch('master')]);
		});
	});

	describe('getCommitFiles', () => {
		it('will return files that are changed, new or deleted in a commit', async () => {
			await repository.open();
			const commitFiles = await repository.getCommitFiles(repository.commits[repository.commits.length - 3]);
			expect(commitFiles.map((it) => it.path)).toEqual(['deleted.txt', 'modified.txt', 'new.txt']);
		});

		it('will return files that are changed, new or deleted in another commit', async () => {
			await repository.open();
			const commitFiles = await repository.getCommitFiles(repository.commits[repository.commits.length - 2]);
			expect(commitFiles.map((it) => it.path)).toEqual(['deleted.txt', 'modified.txt', 'original.txt']);
		});

		it('will return files that are new in the initial commit', async () => {
			await repository.open();
			const commitFiles = await repository.getCommitFiles(repository.commits[repository.commits.length - 1]);
			expect(commitFiles.map((it) => it.path)).toEqual(['initial.txt']);
		});

		it('will reference correct commit in the files returned', async () => {
			await repository.open();
			const commit = repository.commits[repository.commits.length - 2];
			const commitFiles = await repository.getCommitFiles(commit);
			expect(commitFiles.map((it) => it.commit)).toEqual([commit, commit, commit]);
		});
	});

	describe('getDiff', () => {
		it('will return a diff of two modified commit files', async () => {
			await repository.open();
			const fileA = new CommitFile(repository.commits[repository.commits.length - 3], 'modified.txt');
			const fileB = new CommitFile(repository.commits[repository.commits.length - 2], 'modified.txt');
			const diff = await repository.getDiff(fileA, fileB);
			expect(diff).toEqual([
				{
					count: 3,
					added: undefined,
					removed: true,
					value: 'Will be\nmodified.\nTimes are hard for dreamers.\n',
				},
				{
					count: 1,
					added: true,
					removed: undefined,
					value: 'Will be modified\n',
				},
			]);
		});

		it('will return just the actual text of unmodified commit files', async () => {
			await repository.open();
			const fileA = new CommitFile(repository.commits[repository.commits.length - 3], 'original.txt');
			const fileB = new CommitFile(repository.commits[repository.commits.length - 2], 'original.txt');
			const diff = await repository.getDiff(fileA, fileB);
			expect(diff).toEqual([{ value: 'Will not be modified.\n', count: 1 }]);
		});

		it('will return the text of newly added commit file as an addition', async () => {
			await repository.open();
			const fileA = null;
			const fileB = new CommitFile(repository.commits[repository.commits.length - 3], 'new.txt');
			const diff = await repository.getDiff(fileA, fileB);
			expect(diff).toEqual([
				{
					count: 2,
					added: true,
					removed: undefined,
					value: "Maybe she's just...\ndifferent.\n",
				},
			]);
		});

		it('will return the text of removed commit file as a removal', async () => {
			await repository.open();
			const fileA = new CommitFile(repository.commits[repository.commits.length - 2], 'deleted.txt');
			const fileB = null;
			const diff = await repository.getDiff(fileA, fileB);
			expect(diff).toEqual([
				{
					count: 1,
					added: undefined,
					removed: true,
					value: 'Will be deleted.\n',
				},
			]);
		});
	});
});
