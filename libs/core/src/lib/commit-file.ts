import { Commit } from './commit';

export class CommitFile {
	constructor(public readonly commit: Commit, public readonly path: string) {}
}
