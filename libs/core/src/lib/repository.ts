import { Commit } from './commit';

export interface Repository {
	readonly path: string;
	readonly commits: Commit[];
	open(): Promise<void>;
}
