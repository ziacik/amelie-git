import { Commit, NULL_COMMIT } from '@amelie-git/core';

export class PositionedCommit {
	constructor(
		public position: number,
		public readonly commit: Commit,
		public readonly parents: PositionedCommit[],
		public readonly children: PositionedCommit[]
	) {}
}

export const NULL_POSITIONED_COMMIT = new PositionedCommit(0, NULL_COMMIT, [], []);
