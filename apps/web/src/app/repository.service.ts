import { Branch, Commit, CommitFile } from '@amelie-git/core';
import { IpcService } from '@amelie-git/ipc';
import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class RepositoryService {
	constructor(private readonly ipc: IpcService) {}

	getLog(pathToRepository: string): Observable<Commit[]> {
		return from(this.ipc.getLog(pathToRepository));
	}

	getBranches(pathToRepository: string): Observable<Branch[]> {
		return from(this.ipc.getBranches(pathToRepository));
	}

	getCommitFiles(pathToRepository: string, commit: Commit): Observable<CommitFile[]> {
		return from(this.ipc.getCommitFiles(pathToRepository, commit));
	}
}
