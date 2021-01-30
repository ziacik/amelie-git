import { Branch, Commit, CommitFile } from '@amelie-git/core';
import { AfterViewInit, Component } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';
import { RepositoryService } from './repository.service';
import { CommitPositioningService } from './repository/commit-positioning.service';
import { PositionedCommit } from './repository/positioned-commit';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
	title = 'Amelie Git';

	repository: string;
	commits$: Observable<PositionedCommit[]>;
	branches$: Observable<Branch[]>;
	commitFiles$: Observable<CommitFile[]>;

	private selectedCommit$: Subject<Commit>;

	constructor(
		private repositoryService: RepositoryService,
		private commitPositioningService: CommitPositioningService
	) {
		this.selectedCommit$ = new Subject<Commit>();
	}

	ngAfterViewInit(): void {
		this.commitFiles$ = this.selectedCommit$.pipe(
			flatMap((commit) => this.repositoryService.getCommitFiles(this.repository, commit))
		);
	}

	onRepositoryOpened(pathSelected: string): void {
		this.repository = pathSelected;

		this.commits$ = this.repositoryService
			.getLog(pathSelected)
			.pipe(map((commits) => this.commitPositioningService.position(commits)));

		this.branches$ = this.repositoryService.getBranches(pathSelected);
	}

	onCommitSelectionChanged(positionedCommit: PositionedCommit): void {
		this.selectedCommit$.next(positionedCommit?.commit);
	}
}
