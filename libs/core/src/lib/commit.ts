import { NULL_PERSON, Person } from './person';

export class Commit {
	constructor(
		public readonly id: string,
		public readonly name: string,
		public readonly message: string,
		public readonly author: Person,
		public readonly committer: Person,
		public readonly parentIds: string[]
	) {}
}

export const NULL_COMMIT = new Commit('', '', '', NULL_PERSON, NULL_PERSON, []);
