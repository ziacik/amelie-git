import { CommitFile } from '@amelie-git/core';
import { Component, Input } from '@angular/core';

@Component({
	selector: 'app-commit-files-view',
	templateUrl: './commit-files-view.component.html',
	styleUrls: ['./commit-files-view.component.css'],
})
export class CommitFilesViewComponent {
	@Input() commitFiles: CommitFile[];
}
