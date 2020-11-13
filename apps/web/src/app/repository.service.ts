import { Commit } from '@amelie-git/core';
import { Injectable } from '@angular/core';
import { ElectronService } from './electron.service';

@Injectable({
	providedIn: 'root',
})
export class RepositoryService {
	constructor(private readonly electronService: ElectronService) {}

	async getLog(pathToRepository: string): Promise<Commit[]> {
		return this.electronService.invoke("get-log", pathToRepository);
	}
}
