import { Component, Input, OnInit } from '@angular/core';
import { PositionedCommit } from '../repository/positioned-commit';

export type Line = {
	x1: number;
	y1: number;
	x2: number;
	y2: number;
};

@Component({
	selector: 'app-commit-line',
	templateUrl: './commit-line.component.html',
	styleUrls: ['./commit-line.component.scss'],
})
export class CommitLineComponent implements OnInit {
	@Input() positionedCommit: PositionedCommit;
	@Input() transitions: number[];
	@Input() positionsCount: number;

	lines: Line[];

	ngOnInit(): void {
		this.lines = [];
		this.calculateParentLines();
		this.calculateChildLines();
		this.addTransitionLines();
	}

	private addTransitionLines() {
		const transitionPositions = this.transitions || [];
		const transitionLines = transitionPositions.map(verticalLine);
		this.lines.push(...transitionLines);
	}

	private calculateParentLines() {
		const parents = this.positionedCommit?.parents || [];
		const branchParent = parents[0];
		const mergeParents = parents.slice(1);
		const ourPosition = this.positionedCommit?.position || 0;

		const branchLines = branchParent ? [centerDownLine(ourPosition, ourPosition)] : [];
		const mergeLines = mergeParents.map((mergeParent) => centerDownLine(ourPosition, mergeParent.position));

		this.lines.push(...branchLines);
		this.lines.push(...mergeLines);
	}

	private calculateChildLines() {
		const children = this.positionedCommit?.children || [];
		const branchChildren = children.filter((child) => child.parents.indexOf(this.positionedCommit) === 0);
		const mergeChild = children.find((child) => child.parents.indexOf(this.positionedCommit) > 0);
		const ourPosition = this.positionedCommit?.position || 0;

		const branchLines = branchChildren.map((branchChild) => centerUpLine(ourPosition, branchChild.position));
		const mergeLines = mergeChild ? [centerUpLine(ourPosition, ourPosition)] : [];

		this.lines.push(...branchLines);
		this.lines.push(...mergeLines);
	}
}

function centerUpLine(fromPosition: number, toPosition: number): Line {
	return {
		x1: fromPosition + 0.5,
		y1: 0.5,
		x2: toPosition + 0.5,
		y2: 0,
	};
}

function centerDownLine(fromPosition: number, toPosition: number): Line {
	return {
		x1: fromPosition + 0.5,
		y1: 0.5,
		x2: toPosition + 0.5,
		y2: 1,
	};
}

function verticalLine(position: number): Line {
	return {
		x1: position + 0.5,
		y1: 0,
		x2: position + 0.5,
		y2: 1,
	};
}
