import { Commit } from './commit';
import { CommitFile } from './commit-file';

describe('CommitFile', () => {
	it('can be created', () => {
		const commit = new Commit("commit-id", "some commit", "some description", null, null, []);
		const commitFile = new CommitFile(commit, "/some/path");
		expect(commitFile.path).toEqual("/some/path");
		expect(commitFile.commit).toEqual(commit);
	});
});
