import { Branch } from '@amelie-git/core';
import * as fs from 'fs';
import { listBranches, log, ReadCommitResult, walk, Walker, WalkerEntry, WalkerMap } from 'isomorphic-git';
import { IsoRepository } from './iso-repository';

jest.mock('isomorphic-git', () => ({
	log: jest.fn(),
	listBranches: jest.fn(),
	walk: jest.fn(),
	TREE: jest.fn().mockImplementation(({ ref }: { ref: string }) => ref),
}));

type CommitFileEntry = [commitId: string, path: string, entry: WalkerEntry];

describe('IsoRepository', () => {
	let repository: IsoRepository;

	beforeEach(() => {
		repository = new IsoRepository('/some/path');
	});

	describe('open', () => {
		it('will use isomorphic-git to load the repository commits and adds them to the repository', async () => {
			const isoCommit1 = isoCommit('One');
			const isoCommit2 = isoCommit('Two');
			isoCommit2.commit.message = 'Fix: no detail';
			setupCommits(isoCommit1, isoCommit2);
			await repository.open();
			expect(log).toHaveBeenCalledWith({ fs, dir: '/some/path' });
			expect(repository.commits.length).toBe(2);
			const [commit1, commit2] = repository.commits;
			expect(commit1.id).toBe('sha-one');
			expect(commit1.name).toBe('Fix: Some One fix');
			expect(commit1.message).toBe('Some One fix commit description');
			expect(commit1.author.name).toBe('One Author');
			expect(commit1.author.email).toBe('one@author');
			expect(commit1.committer.name).toBe('One Committer');
			expect(commit1.committer.email).toBe('one@committer');
			expect(commit1.parentIds).toEqual(['sha-parent']);
			expect(commit2.id).toBe('sha-two');
			expect(commit2.name).toBe('Fix: no detail');
			expect(commit2.message).toBeFalsy();
			expect(commit2.author.name).toBe('Two Author');
			expect(commit2.author.email).toBe('two@author');
			expect(commit2.committer.name).toBe('Two Committer');
			expect(commit2.committer.email).toBe('two@committer');
			expect(commit2.parentIds).toEqual(['sha-parent']);
		});

		it('will use isomorphic-git to get the repository branches and adds them to the repository', async () => {
			(listBranches as jest.Mock).mockResolvedValue(['branch-a', 'branch-b']);
			await repository.open();
			expect(listBranches).toHaveBeenCalledWith({ fs, dir: '/some/path' });
			expect(repository.branches).toEqual([new Branch('branch-a'), new Branch('branch-b')]);
		});
	});

	describe('getCommitFiles', () => {
		let commitFileEntries: CommitFileEntry[];

		beforeEach(() => {
			commitFileEntries = [
				['sha-head', '.', isoWalkerEntry('tree')],
				['sha-head', '/some', isoWalkerEntry('tree')],
				['sha-head', '/some/original.txt', isoWalkerEntry('blob', 'original, will not be modified')],
				['sha-head', '/some/modified.txt', isoWalkerEntry('blob', 'has been modified')],
				['sha-head', '/some/new.txt', isoWalkerEntry('blob', 'a new one')],
				['sha-second', '.', isoWalkerEntry('tree')],
				['sha-second', '/some/deleted.txt', isoWalkerEntry('blob', 'will be deleted')],
				['sha-second', '/some/original.txt', isoWalkerEntry('blob', 'original, will not be modified')],
				['sha-second', '/some/modified.txt', isoWalkerEntry('blob', 'will be modified')],
				['sha-initial', '/some/initial.txt', isoWalkerEntry('blob', 'some initial commit entry')],
			];
			setupCommits(isoCommit('head', ['second']), isoCommit('second', ['initial']), isoCommit('initial', []));
			setupWalk(commitFileEntries);
		});

		it('will return files that are changed, new or deleted in a HEAD commit', async () => {
			await repository.open();
			const commitFiles = await repository.getCommitFiles(repository.commits[0]);
			expect(commitFiles.map((it) => it.path)).toEqual(['/some/modified.txt', '/some/new.txt', '/some/deleted.txt']);
		});

		it('will return files that are changed, new or deleted in a non-HEAD commit', async () => {
			await repository.open();
			const commitFiles = await repository.getCommitFiles(repository.commits[1]);
			expect(commitFiles.map((it) => it.path)).toEqual([
				'/some/deleted.txt',
				'/some/original.txt',
				'/some/modified.txt',
				'/some/initial.txt',
			]);
		});

		it('will return files that are new in the initial commit', async () => {
			await repository.open();
			const commitFiles = await repository.getCommitFiles(repository.commits[2]);
			expect(commitFiles.map((it) => it.path)).toEqual(['/some/initial.txt']);
		});
	});
});

function setupWalk(commitFileEntries: CommitFileEntry[]): void {
	const walkMock = walk as jest.Mock;
	walkMock.mockImplementation(async ({ trees, map }) => fakeWalk(trees, commitFileEntries, map));
}

async function fakeWalk(trees: Walker[], commitFileEntries: CommitFileEntry[], map: WalkerMap): Promise<unknown> {
	const selectedCommitIds = new Set(trees.map((tree) => tree.toString()));
	const selectedCommitIdArray = [...selectedCommitIds];
	const selectedCommitEntries = commitFileEntries.filter(([commitId]) => selectedCommitIds.has(commitId));
	const selectedPaths = selectedCommitEntries.reduce((result, [, path]) => result.add(path), new Set<string>());
	const results = [];

	for (const path of selectedPaths) {
		const entries = selectedCommitIdArray.map((commitId) => tryGetEntryFor(commitId, path));

		const result = await map(path, entries);
		if (result) results.push(result);
	}

	return results;

	function tryGetEntryFor(commitId: string, path: string): WalkerEntry {
		const byCommitIdAndPath = ([entryCommitId, entryPath]: CommitFileEntry): boolean =>
			entryCommitId === commitId && entryPath === path;
		const commitFileEntry = selectedCommitEntries.find(byCommitIdAndPath);
		const walkerEntry = commitFileEntry ? commitFileEntry[2] : undefined;
		return walkerEntry;
	}
}

function setupCommits(...isoCommits: ReadCommitResult[]): void {
	const logMock = log as jest.Mock;
	logMock.mockResolvedValue(isoCommits);
}

function isoCommit(foo: string, parentFoos = ['parent']): ReadCommitResult {
	return {
		oid: `sha-${foo.toLowerCase()}`,
		commit: {
			message: `Fix: Some ${foo} fix\n\nSome ${foo} fix commit description`,
			tree: `tree-${foo}`,
			parent: parentFoos.map((parentFoo) => `sha-${parentFoo.toLowerCase()}`),
			author: {
				name: `${foo} Author`,
				email: `${foo.toLowerCase()}@author`,
				timestamp: 100000,
				timezoneOffset: 2,
			},
			committer: {
				name: `${foo} Committer`,
				email: `${foo.toLowerCase()}@committer`,
				timestamp: 200000,
				timezoneOffset: 0,
			},
		},
		payload: '',
	};
}

function isoWalkerEntry(type: 'blob' | 'tree', content?: string): WalkerEntry {
	const entry: WalkerEntry = {
		type: () => Promise.resolve(type),
		content: () => (content ? Promise.resolve(Buffer.from(content)) : null),
		mode: () => null,
		oid: () => null,
		stat: () => null,
	};
	return entry;
}
