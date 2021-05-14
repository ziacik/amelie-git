import { CommitFile } from '@amelie-git/core';

export interface CommitFileFlatNode {
	expandable: boolean;
	name: string;
	file: CommitFile;
	level: number;
	selected: boolean;
}
