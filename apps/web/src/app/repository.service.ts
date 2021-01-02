import { Branch, Commit } from '@amelie-git/core';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ElectronService } from './electron.service';

@Injectable({
	providedIn: 'root',
})
export class RepositoryService {
	constructor(private readonly electronService: ElectronService) {}

	getLog(pathToRepository: string): Observable<Commit[]> {
		return this.electronService.invoke('get-log', pathToRepository);
	}

	getBranches(pathToRepository: string): Observable<Branch[]> {
		return this.electronService.invoke('get-branches', pathToRepository);
	}
}
