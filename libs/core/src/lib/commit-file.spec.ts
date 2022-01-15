import { Commit } from './commit';
import { CommitFile } from './commit-file';
import { NULL_PERSON } from './person';

describe('CommitFile', () => {
	it('can be created', () => {
		const commit = new Commit('commit-id', 'some commit', 'some description', NULL_PERSON, NULL_PERSON, []);
		const commitFile = new CommitFile(commit, '/some/path');
		expect(commitFile.path).toEqual('/some/path');
		expect(commitFile.commit).toEqual(commit);
	});
});
