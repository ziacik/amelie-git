import { Commit } from '@amelie-git/core';

export class PositionedCommit {
	constructor(
		public readonly position: number,
		public readonly commit: Commit,
		public readonly parents: PositionedCommit[],
		public readonly transitions: PositionedCommit[]
	) {}
}
