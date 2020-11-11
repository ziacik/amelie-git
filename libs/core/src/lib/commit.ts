import { Person } from './person';

export class Commit {
	constructor(
		public readonly id: string,
		public readonly name: string,
		public readonly message: string,
		public readonly author: Person,
		public readonly committer: Person
	) {}
}
