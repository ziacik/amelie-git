import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RepositoryService } from './repository.service';
import { CommitPositioningService } from './repository/commit-positioning.service';
import { PositionedCommit } from './repository/positioned-commit';

@Component({
	selector: 'amelie-git-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
	title = 'Amelie Git';
	commits$: Observable<PositionedCommit[]>;

	constructor(
		private repositoryService: RepositoryService,
		private commitPositioningService: CommitPositioningService
	) {}

	ngOnInit(): void {
		this.commits$ = this.repositoryService
			.getLog('')
			.pipe(map((commits) => this.commitPositioningService.position(commits)));
	}
}
