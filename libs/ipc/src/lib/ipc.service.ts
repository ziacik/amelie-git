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
		const result = await Neutralino.os.execCommand(
			`git -C "${path}" for-each-ref --format='%(refname:short)' refs/heads/`
		);

		if (result.exitCode !== 0) {
			throw new Error('Git error: ' + result.stdErr);
		}

		return result.stdOut
			.split('\n')
			.map((it) => it.trim())
			.filter(Boolean)
			.map((name) => new Branch(name));
	}

	async getCommitFiles(path: string, commit: Commit): Promise<CommitFile[]> {
		return [];
	}
}
