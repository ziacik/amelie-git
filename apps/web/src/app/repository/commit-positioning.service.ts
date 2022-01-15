import { Commit } from '@amelie-git/core';
import { Injectable } from '@angular/core';
import { NULL_POSITIONED_COMMIT, PositionedCommit } from './positioned-commit';

type Position = number;
type TakenPositionDescriptor = {
	commit: PositionedCommit;
	stop?: boolean;
};

const NULL_TAKEN_POSITION: TakenPositionDescriptor = {
	commit: NULL_POSITIONED_COMMIT,
};

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
	private takenPositions: TakenPositionDescriptor[] = [];

	constructor(public readonly commits: Commit[]) {}

	position(): PositionedCommit[] {
		this.takenPositions = [];

		const positionedCommits = this.commits.map((commit) => new PositionedCommit(0, commit, [], []));
		const positionedCommitsById: { [key: string]: PositionedCommit } = positionedCommits.reduce(
			(acc, cur) => ({ ...acc, [cur.commit.id]: cur }),
			{}
		);

		for (const positionedCommit of positionedCommits) {
			const commit = positionedCommit.commit;
			positionedCommit.parents.push(...commit.parentIds.map((id) => positionedCommitsById[id]));
			positionedCommit.parents.forEach((parent) => parent.children.push(positionedCommit));

			const ourPositionInTaken = this.takenPositionOf(positionedCommit);
			const ourRealPosition = ourPositionInTaken >= 0 ? ourPositionInTaken : this.firstFreePosition();

			this.removeStopPositions(positionedCommit);

			const branchParent = positionedCommit.parents[0];
			const mergeParents = positionedCommit.parents.slice(1);

			this.addBranchParentToTaken(branchParent, ourPositionInTaken);
			this.addMergeParentsToTaken(mergeParents);

			positionedCommit.position = ourRealPosition;
		}

		return positionedCommits;
	}

	private addMergeParentsToTaken(mergeParents: PositionedCommit[]): void {
		mergeParents
			.filter((mergeParent) => this.takenPositionOf(mergeParent) < 0)
			.forEach((mergeParent) => this.addToFirstFreePosition(mergeParent));
	}

	private addBranchParentToTaken(branchParent: PositionedCommit, ourPositionInTaken: number): void {
		if (!branchParent) {
			return;
		}

		const branchParentPositionInTaken = this.takenPositionOf(branchParent);

		if (ourPositionInTaken >= 0 && branchParentPositionInTaken >= 0) {
			this.takenPositions[ourPositionInTaken] = { commit: branchParent, stop: true };
		} else if (ourPositionInTaken >= 0 && branchParentPositionInTaken < 0) {
			this.takenPositions[ourPositionInTaken] = { commit: branchParent };
		} else {
			this.addToFirstFreePosition(branchParent);
		}
	}

	private removeStopPositions(positionedCommit: PositionedCommit): void {
		for (let i = 0; i < this.takenPositions.length; i++) {
			const takenPosition = this.takenPositions[i];
			if (takenPosition?.stop && this.takenPositions[i]?.commit === positionedCommit) {
				this.takenPositions[i] = NULL_TAKEN_POSITION;
			}
		}
	}

	private takenPositionOf(commit: PositionedCommit): Position {
		return this.takenPositions.findIndex((takenPosition) => takenPosition?.commit === commit && !takenPosition?.stop);
	}

	private firstFreePosition(): Position {
		const freePosition = this.takenPositions.indexOf(NULL_TAKEN_POSITION);
		return freePosition >= 0 ? freePosition : this.takenPositions.length;
	}

	private addToFirstFreePosition(commit: PositionedCommit): Position {
		const freePosition = this.firstFreePosition();
		this.takenPositions[freePosition] = { commit };
		return freePosition;
	}
}
