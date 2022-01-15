import { Commit, NULL_COMMIT } from './commit';

export class CommitFile {
	constructor(public readonly commit: Commit, public readonly path: string) {}
}

export const NULL_COMMIT_FILE = new CommitFile(NULL_COMMIT, '');
