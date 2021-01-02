import { Branch } from '@amelie-git/core';
import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RepositoryService } from './repository.service';
import { CommitPositioningService } from './repository/commit-positioning.service';
import { PositionedCommit } from './repository/positioned-commit';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent {
	title = 'Amelie Git';

	repository: string;
	commits$: Observable<PositionedCommit[]>;
	branches$: Observable<Branch[]>;

	constructor(
		private repositoryService: RepositoryService,
		private commitPositioningService: CommitPositioningService
	) {}

	onRepositoryOpened(pathSelected: string): void {
		this.repository = pathSelected;

		this.commits$ = this.repositoryService
			.getLog(pathSelected)
			.pipe(map((commits) => this.commitPositioningService.position(commits)));

		this.branches$ = this.repositoryService.getBranches(pathSelected);
	}
}
