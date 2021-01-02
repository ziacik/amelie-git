import { Branch } from '@amelie-git/core';
import { Component, Input } from '@angular/core';

@Component({
	selector: 'app-branch-view',
	templateUrl: './branch-view.component.html',
	styleUrls: ['./branch-view.component.scss'],
})
export class BranchViewComponent {
	@Input() branches: Branch[] = [];
}
