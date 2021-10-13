import { Change } from 'diff';
import { Branch } from './branch';
import { Commit } from './commit';
import { CommitFile } from './commit-file';

export interface Repository {
	readonly path: string;
	readonly commits: Commit[];
	readonly branches: Branch[];

	open(): Promise<void>;
	getCommitFiles(commit: Commit): Promise<CommitFile[]>;
	getDiff(commitFileA: CommitFile, commitFileB: CommitFile): Promise<Change[]>;
}
