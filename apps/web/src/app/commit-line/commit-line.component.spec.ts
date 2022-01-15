import { Commit, Person } from '@amelie-git/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NULL_POSITIONED_COMMIT, PositionedCommit } from '../repository/positioned-commit';
import { ColorIndex, CommitLineComponent, Line } from './commit-line.component';

describe('CommitLineComponent', () => {
	let component: CommitLineComponent;
	let fixture: ComponentFixture<CommitLineComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [CommitLineComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(CommitLineComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		component.positionsCount = 3;
	});

	it('shows a commit subject', () => {
		const commit = singleCommit(0);
		component.positionedCommit = commit;
		fixture.detectChanges();
		expect(fixture.debugElement.nativeElement.textContent).toContain('commit subject');
	});

	describe('calculation of lines', () => {
		it('of just a single commit', () => {
			component.positionedCommit = singleCommit(0);
			component.ngOnInit();
			expect(asStrings(component.lines)).toEqual([]);
		});

		it('with one parent at the same position', () => {
			component.positionedCommit = commitWithParents(0, [0]);
			component.ngOnInit();
			expect(asStrings(component.lines)).toEqual(['0.5:0.5 -> 0.5:1']);
		});

		it('with one parent to the right (branch parent always goes vertical first)', () => {
			component.positionedCommit = commitWithParents(0, [2]);
			component.ngOnInit();
			expect(asStrings(component.lines)).toEqual(['0.5:0.5 -> 0.5:1']);
		});

		it('with one parent to the left (branch parent always goes vertical first)', () => {
			component.positionedCommit = commitWithParents(1, [0]);
			component.ngOnInit();
			expect(asStrings(component.lines)).toEqual(['1.5:0.5 -> 1.5:1']);
		});

		it('with three parents (merge parents always go horizontal first)', () => {
			component.positionedCommit = commitWithParents(0, [1, 2, 3]);
			component.ngOnInit();
			expect(asStrings(component.lines)).toEqual(['0.5:0.5 -> 0.5:1', '0.5:0.5 -> 2.5:1', '0.5:0.5 -> 3.5:1']);
		});

		it('with one child at the same position', () => {
			component.positionedCommit = commitWithBranchChildren(0, [0]);
			component.ngOnInit();
			expect(asStrings(component.lines)).toEqual(['0.5:0.5 -> 0.5:0']);
		});

		it('with one branch child to the right (branch child always goes horizontal first unless same position)', () => {
			component.positionedCommit = commitWithBranchChildren(0, [2]);
			component.ngOnInit();
			expect(asStrings(component.lines)).toEqual(['0.5:0.5 -> 2.5:0']);
		});

		it('with one branch child to the left (branch child always goes horizontal first unless same position)', () => {
			component.positionedCommit = commitWithBranchChildren(1, [0]);
			component.positionedCommit.position = 1;
			component.ngOnInit();
			expect(asStrings(component.lines)).toEqual(['1.5:0.5 -> 0.5:0']);
		});

		it('with one merge child to the right (merge child always goes vertical first)', () => {
			component.positionedCommit = commitWithMergeChildren(0, [2]);
			component.ngOnInit();
			expect(asStrings(component.lines)).toEqual(['0.5:0.5 -> 0.5:0']);
		});

		it('with one merge child to the left (merge child always goes vertical first)', () => {
			component.positionedCommit = commitWithMergeChildren(1, [0]);
			component.positionedCommit.position = 1;
			component.ngOnInit();
			expect(asStrings(component.lines)).toEqual(['1.5:0.5 -> 1.5:0']);
		});

		it('with transitions', () => {
			component.transitions = [1, 2];
			component.ngOnInit();
			expect(asStrings(component.lines)).toEqual(['1.5:0 -> 1.5:1', '2.5:0 -> 2.5:1']);
		});
	});

	describe('calculation of colors', () => {
		it('with one parent at the same position', () => {
			component.positionedCommit = commitWithParents(0, [0]);
			component.ngOnInit();
			expect(asColors(component.lines)).toEqual([0]);
		});

		it('with one parent to the right (branch parent is always the same color, based on the commit position)', () => {
			component.positionedCommit = commitWithParents(0, [2]);
			component.ngOnInit();
			expect(asColors(component.lines)).toEqual([0]);
		});

		it('with one parent to the left (branch parent is always the same color, based on the commit position)', () => {
			component.positionedCommit = commitWithParents(1, [0]);
			component.ngOnInit();
			expect(asColors(component.lines)).toEqual([1]);
		});

		it('with three parents (merge parents are always different color, based on the position of the parent)', () => {
			component.positionedCommit = commitWithParents(0, [1, 2, 3]);
			component.ngOnInit();
			expect(asColors(component.lines)).toEqual([0, 2, 3]);
		});

		it('with one child at the same position', () => {
			component.positionedCommit = commitWithBranchChildren(0, [0]);
			component.ngOnInit();
			expect(asColors(component.lines)).toEqual([0]);
		});

		it('with one branch child to the right (branch child has color based on position of the child)', () => {
			component.positionedCommit = commitWithBranchChildren(0, [2]);
			component.ngOnInit();
			expect(asColors(component.lines)).toEqual([2]);
		});

		it('with one branch child to the left (branch child has color based on position of the child)', () => {
			component.positionedCommit = commitWithBranchChildren(1, [0]);
			component.positionedCommit.position = 1;
			component.ngOnInit();
			expect(asColors(component.lines)).toEqual([0]);
		});

		it('with one merge child to the right (merge child has always the same color based on position of the commit)', () => {
			component.positionedCommit = commitWithMergeChildren(0, [2]);
			component.ngOnInit();
			expect(asColors(component.lines)).toEqual([0]);
		});

		it('with one merge child to the left (merge child has always the same color based on position of the commit)', () => {
			component.positionedCommit = commitWithMergeChildren(1, [0]);
			component.positionedCommit.position = 1;
			component.ngOnInit();
			expect(asColors(component.lines)).toEqual([1]);
		});

		it('with transitions (transition colors are based on their position)', () => {
			component.transitions = [1, 2];
			component.ngOnInit();
			expect(asColors(component.lines)).toEqual([1, 2]);
		});
	});

	describe('color translation', () => {
		it('returns a color for the position, rotating if the index exceeds number of available colors', () => {
			component.colors = ['red', 'pink', 'white'];
			expect(component.colorFor(0)).toEqual('red');
			expect(component.colorFor(1)).toEqual('pink');
			expect(component.colorFor(2)).toEqual('white');
			expect(component.colorFor(3)).toEqual('red');
			expect(component.colorFor(4)).toEqual('pink');
		});
	});
});

function asStrings(lines: Line[]): string[] {
	return lines.map((line) => `${line.x1}:${line.y1} -> ${line.x2}:${line.y2}`);
}

function asColors(lines: Line[]): ColorIndex[] {
	return lines.map((line) => line.color);
}

function singleCommit(position: number): PositionedCommit {
	return new PositionedCommit(
		position,
		new Commit(
			'id',
			'commit subject',
			'commit message',
			new Person('Amélie', 'amelie@mail'),
			new Person('Amélie', 'amelie@mail'),
			[]
		),
		[],
		[]
	);
}

function commitWithParents(position: number, parentPositions: number[]): PositionedCommit {
	const commit = singleCommit(position);
	commit.parents.push(...parentPositions.map(singleCommit));
	return commit;
}

function commitWithBranchChildren(position: number, childPositions: number[]): PositionedCommit {
	const commit = singleCommit(position);
	commit.children.push(...childPositions.map(singleCommit));
	// Note that a child is a "branch" child if our commit is its first parent.
	commit.children.forEach((child) => child.parents.push(commit));
	return commit;
}

function commitWithMergeChildren(position: number, childPositions: number[]): PositionedCommit {
	const commit = singleCommit(position);
	commit.children.push(...childPositions.map(singleCommit));
	// Note that a child is a "merge" child if our commit is not its first parent.
	commit.children.forEach((child) => child.parents.push(NULL_POSITIONED_COMMIT, commit));
	return commit;
}
