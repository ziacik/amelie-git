import { Commit } from '@amelie-git/core';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { RepositoryService } from './repository.service';

@Component({
	selector: 'amelie-git-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
	title = 'Amelie Git';
	commits$: Observable<Commit[]>;

	constructor(private repositoryService: RepositoryService, private changeDetector: ChangeDetectorRef) {}

	ngOnInit(): void {
		this.commits$ = this.repositoryService.getLog('');
	}
}
