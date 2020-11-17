import { Commit } from '@amelie-git/core';

export class PositionedCommit {
	constructor(public readonly column: number, public readonly commit: Commit) {}
}
