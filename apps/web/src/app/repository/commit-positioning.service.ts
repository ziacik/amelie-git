import { Commit } from '@amelie-git/core';
import { Injectable } from '@angular/core';
import { PositionedCommit } from './positioned-commit';

type Coordinate = [row: number, position: number];

/// Algorithm credit @PierreVigier https://pvigier.github.io/2019/05/06/commit-graph-drawing-algorithms.html
/// Algorithm adjusted

@Injectable({
	providedIn: 'root',
})
export class CommitPositioningService {
	position(commits: Commit[]): PositionedCommit[] {
		const positioner = new CommitPositioner(commits);
		return positioner.position();
	}
}

class CommitPositioner {
	private rowTakenPositions: Set<number>[];
	private coordinatesById: { [key: string]: Coordinate };
	private childrenById: { [key: string]: Commit[] };

	constructor(public readonly commits: Commit[]) {}

	position(): PositionedCommit[] {
		this.rowTakenPositions = [];
		this.coordinatesById = {};
		this.childrenById = {};

		const currentTakenPositions = new Set<number>();

		for (let row = 0; row < this.commits.length; row++) {
			const commit = this.commits[row];

			this.coordinatesById[commit.id] = [row, 0];

			this.addToChildrenById(commit);

			const forbiddenPositions = this.calculateForbiddenPositions(commit);

			const branchChildren = this.branchChildren(commit);
			const branchChildForPositioning = branchChildren.find((branchChild) => {
				const branchPosition = this.getPosition(branchChild);
				return !forbiddenPositions.has(branchPosition);
			});

			let position: number;

			if (branchChildForPositioning) {
				const branchChildPosition = this.getPosition(branchChildForPositioning);
				position = branchChildPosition;
			} else {
				const freePosition = this.findLowestFreePosition(currentTakenPositions);
				position = freePosition;
			}

			currentTakenPositions.add(position);

			branchChildren
				.filter((branchChild) => branchChild !== branchChildForPositioning)
				.forEach((branchChild) => {
					const branchChildPosition = this.getPosition(branchChild);
					currentTakenPositions.delete(branchChildPosition);
				});

			this.rowTakenPositions.push(currentTakenPositions);

			this.coordinatesById[commit.id][1] = position;
		}

		return this.createPositionedCommits();
	}

	private createPositionedCommits() {
		const positionedCommits = this.commits.map(
			(commit) => new PositionedCommit(this.getPosition(commit), commit, [], [])
		);

		const positionedCommitsById = positionedCommits.reduce((map, positionedCommit) => {
			map[positionedCommit.commit.id] = positionedCommit;
			return map;
		}, {});

		for (const positionedCommit of positionedCommits) {
			const parents = positionedCommit.commit.parentIds.map((parentId) => positionedCommitsById[parentId]);
			positionedCommit.parents.push(...parents);

			const thisRow = this.getRow(positionedCommit.commit);

			for (const parent of parents) {
				const parentRow = this.getRow(parent.commit);
				const parentPosition = parent.position;

				for (let row = thisRow; row <= parentRow; row++) {
					const transitions = positionedCommits[row].transitions;
					if (!transitions[parentPosition]) transitions[parentPosition] = positionedCommit;
				}
			}
		}

		return positionedCommits;
	}

	private addToChildrenById(commit: Commit) {
		commit.parentIds.forEach((parentId) => {
			if (!this.childrenById[parentId]) this.childrenById[parentId] = [];
			this.childrenById[parentId].push(commit);
		});
	}

	private branchChildren(commit: Commit): Commit[] {
		const children = this.childrenById[commit.id] || [];
		const branchChilden = children.filter((child) => child.parentIds[child.parentIds.length - 1] === commit.id);
		return branchChilden;
	}

	private mergeChilden(commit: Commit): Commit[] {
		const children = this.childrenById[commit.id] || [];
		const branchChilden = children.filter((child) => child.parentIds[child.parentIds.length - 1] !== commit.id);
		return branchChilden;
	}

	private getRow(commit: Commit): number {
		const [row] = this.coordinatesById[commit.id];
		return row;
	}

	private getPosition(commit: Commit): number {
		const [, position] = this.coordinatesById[commit.id];
		return position;
	}

	private findLowestFreePosition(currentTakenPositions: Set<number>): number {
		let expectedFreePosition = 0;
		for (const takenPosition of currentTakenPositions) {
			if (takenPosition !== expectedFreePosition) return expectedFreePosition;
			expectedFreePosition++;
		}
		return expectedFreePosition;
	}

	private calculateForbiddenPositions(commit: Commit): Set<number> {
		const mergeChildren = this.mergeChilden(commit);
		if (!mergeChildren.length) return new Set<number>();

		const forbiddenPositions = new Set<number>();
		const mergeChildrenRows = mergeChildren.map((mergeChild) => this.getRow(mergeChild));
		const minRow = Math.min(...mergeChildrenRows);

		for (let row = minRow; row < this.rowTakenPositions.length; row++) {
			const takenPositions = this.rowTakenPositions[row];
			for (const takenPosition of takenPositions) {
				forbiddenPositions.add(takenPosition);
			}
		}

		return forbiddenPositions;
	}
}
