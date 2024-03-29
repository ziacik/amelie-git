import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatSelectionListChange } from '@angular/material/list';
import { PositionedCommit } from '../repository/positioned-commit';

@Component({
	selector: 'app-log-view',
	templateUrl: './log-view.component.html',
	styleUrls: ['./log-view.component.scss'],
})
export class LogViewComponent {
	private transitionsForCommits: WeakMap<PositionedCommit, number[]> = new WeakMap<PositionedCommit, number[]>();
	private _commits: PositionedCommit[] = [];

	@Output() selectionChange: EventEmitter<PositionedCommit> = new EventEmitter();

	@Input() get commits(): PositionedCommit[] {
		return this._commits;
	}

	set commits(value: PositionedCommit[]) {
		this._commits = value;
		this.calculate();
	}

	positionsCount = 0;

	private calculate(): void {
		this.positionsCount = 0;
		this.transitionsForCommits = new WeakMap<PositionedCommit, number[]>();
		this.commits.forEach((commit) => this.transitionsForCommits.set(commit, []));

		for (let i = 0; i < this.commits.length; i++) {
			const commit = this.commits[i];

			if (commit.position >= this.positionsCount) {
				this.positionsCount = commit.position + 1;
			}

			let isBranchParent = true;
			for (const parent of commit.parents) {
				this.addTransitions(i, commit, parent, isBranchParent);
				isBranchParent = false;
			}
		}
	}

	private addTransitions(
		fromRow: number,
		commit: PositionedCommit,
		parent: PositionedCommit,
		isBranchParent: boolean
	): void {
		const transitionPosition = isBranchParent ? commit.position : parent.position;

		for (let i = fromRow + 1; i < this.commits.length; i++) {
			const currentCommit = this.commits[i];

			if (currentCommit === parent) {
				break;
			}

			const transitions = this.transitionsForCommit(currentCommit);
			transitions.push(transitionPosition);
		}
	}

	transitionsForCommit(commit: PositionedCommit): number[] {
		return this.transitionsForCommits.get(commit) || [];
	}

	selectionChanged(change: MatSelectionListChange): void {
		const option = change.options[0];
		const selectedId = option.value;
		const selectedCommit = this._commits.find((c) => c.commit.id === selectedId); // todo optimize
		this.selectionChange.emit(selectedCommit);
	}
}
