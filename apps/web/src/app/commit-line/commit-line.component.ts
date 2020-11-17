import { Component, Input } from '@angular/core';
import { PositionedCommit } from '../repository/positioned-commit';

@Component({
	selector: 'amelie-git-commit-line',
	templateUrl: './commit-line.component.html',
	styleUrls: ['./commit-line.component.scss'],
})
export class CommitLineComponent {
	@Input() positionedCommit: PositionedCommit;
}
