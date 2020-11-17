import { Component, Input } from '@angular/core';
import { PositionedCommit } from '../repository/positioned-commit';

@Component({
	selector: 'amelie-git-log-view',
	templateUrl: './log-view.component.html',
	styleUrls: ['./log-view.component.scss'],
})
export class LogViewComponent {
	@Input() commits: PositionedCommit[] = [];
}
