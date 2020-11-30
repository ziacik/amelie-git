import { Component, Input } from '@angular/core';
import { PositionedCommit } from '../repository/positioned-commit';

@Component({
	selector: 'amelie-git-log-view',
	templateUrl: './log-view.component.html',
	styleUrls: ['./log-view.component.scss'],
})
export class LogViewComponent {
	private transitionsForCommits: WeakMap<PositionedCommit, number[]>;
	private _commits: PositionedCommit[] = [];

	@Input() get commits(): PositionedCommit[] {
		return this._commits;
	}

	set commits(value: PositionedCommit[]) {
		this._commits = value;
		this.calculate();
	}

	positionsCount: number;

	private calculate() {
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

	private addTransitions(fromRow: number, commit: PositionedCommit, parent: PositionedCommit, isBranchParent: boolean) {
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
		return this.transitionsForCommits.get(commit);
	}
}
