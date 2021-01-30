import { CommitFile } from './commit-file';

describe('CommitFile', () => {
	it('can be created', () => {
		const commitFile = new CommitFile("/some/path");
		expect(commitFile.path).toEqual("/some/path");
	});
});
