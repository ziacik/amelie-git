import { Branch, Commit, CommitFile } from '@amelie-git/core';
import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root',
})
export class IpcService {
	constructor() {
		Neutralino.init();
	}

	async openRepository(): Promise<string | undefined> {
		return Neutralino.os.showFolderDialog('Open git repository');
	}

	async getLog(path: string): Promise<Commit[]> {
		return [];
	}

	async getBranches(path: string): Promise<Branch[]> {
		return [];
	}

	async getCommitFiles(path: string, commit: Commit): Promise<CommitFile[]> {
		return [];
	}
}
