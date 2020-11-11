import { Commit } from './commit';
import { Person } from './person';

describe('Commit', () => {
	it('can be created', () => {
		const author = new Person("Author", "author@mail");
		const committer = new Person("Committer", "committer@mail");
		const commit = new Commit("commit-id", "name", "message", author, committer);
		expect(commit.id).toEqual("commit-id");
		expect(commit.name).toEqual("name");
		expect(commit.message).toEqual("message");
		expect(commit.author).toBe(author);
		expect(commit.committer).toBe(committer);
	});
});
