import { Commit } from '@amelie-git/core';

export class PositionedCommit {
	constructor(
		public position: number,
		public readonly commit: Commit,
		public readonly parents: PositionedCommit[],
		public readonly children: PositionedCommit[],
		public readonly transitions: PositionedCommit[]
	) {}
}
