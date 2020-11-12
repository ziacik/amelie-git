import { IsoRepository } from './iso-repository';
import { log, ReadCommitResult } from 'isomorphic-git';
import * as fs from 'fs';

jest.mock('isomorphic-git', () => ({
	log: jest.fn(),
}));

describe('IsoRepository', () => {
	let repository: IsoRepository;

	beforeEach(() => {
		repository = new IsoRepository('/some/path');
	});

	describe('open', () => {
		it('will use isomorphic-git to load the repository commits and adds them to the repository', async () => {
			const isoCommit1: ReadCommitResult = isoCommit('One');
			const isoCommit2: ReadCommitResult = isoCommit('Two');
			isoCommit2.commit.message = 'Fix: no detail';
			(log as jest.Mock).mockResolvedValue([isoCommit1, isoCommit2]);
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
			expect(commit2.id).toBe('sha-two');
			expect(commit2.name).toBe('Fix: no detail');
			expect(commit2.message).toBeFalsy();
			expect(commit2.author.name).toBe('Two Author');
			expect(commit2.author.email).toBe('two@author');
			expect(commit2.committer.name).toBe('Two Committer');
			expect(commit2.committer.email).toBe('two@committer');
		});
	});
});

function isoCommit(foo: string): ReadCommitResult {
	return {
		oid: `sha-${foo.toLowerCase()}`,
		commit: {
			message: `Fix: Some ${foo} fix\n\nSome ${foo} fix commit description`,
			tree: `tree-${foo}`,
			parent: [`parent1-${foo}`, `parent2-${foo}`],
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
