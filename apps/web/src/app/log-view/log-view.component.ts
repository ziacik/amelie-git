import { Commit } from '@amelie-git/core';
import { Component, Input } from '@angular/core';

@Component({
	selector: 'amelie-git-log-view',
	templateUrl: './log-view.component.html',
	styleUrls: ['./log-view.component.scss'],
})
export class LogViewComponent {
	@Input() commits: Commit[] = [];
}
