import { Commit, Person } from '@amelie-git/core';
import { waitFor } from '@amelie-git/testing';
import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatListModule, MatListOption, MatSelectionList } from '@angular/material/list';
import { By } from '@angular/platform-browser';
import { CommitLineComponent } from '../commit-line/commit-line.component';
import { PositionedCommit } from '../repository/positioned-commit';
import { LogViewComponent } from './log-view.component';

describe('LogViewComponent', () => {
	let component: LogViewComponent;
	let fixture: ComponentFixture<LogViewComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [MatListModule],
			declarations: [LogViewComponent, CommitLineComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(LogViewComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('shows a list of commits', () => {
		const positionedCommits = [singleCommit(0)];
		component.commits = positionedCommits;
		fixture.detectChanges();
		expect(fixture.debugElement.nativeElement.textContent).toContain('commit subject');
	});

	it('triggers a selection event when a commit line is selected', async () => {
		const commits = [singleCommit(0)];
		component.commits = commits;
		fixture.detectChanges();
		const lineElement: DebugElement = fixture.debugElement.query(By.directive(CommitLineComponent));

		const commitSelected = await waitFor(component.selectionChange, () => {
			lineElement.nativeElement.click();
			fixture.detectChanges();
		});

		expect(commitSelected).toEqual(commits[0]);
	});

	xit('triggers a selection event with null commit when a commit line is unselected', async () => {
		const commits = [singleCommit(0)];
		component.commits = commits;
		fixture.detectChanges();

		const lineElement: DebugElement = fixture.debugElement.query(By.directive(CommitLineComponent));
		const selectionComponent: MatSelectionList = fixture.debugElement
			.queryAll(By.directive(MatSelectionList))
			.map((it) => it.componentInstance)[0];

		// lineElement.nativeElement.click();
		fixture.detectChanges();
		const alineElement: DebugElement = fixture.debugElement.query(By.directive(MatListOption));

		const commitSelected = await waitFor(component.selectionChange, () => {
			console.log('gonna click');
			alineElement.triggerEventHandler('click', { ctrlKey: true });
			// selectionComponent.deselectAll();
			fixture.detectChanges();
		});

		expect(commitSelected).toBeNull();
	});

	it('sets positionsCount to each line (i.e. max right position of all commits + 1', () => {
		const positionedCommits = [singleCommit(2), singleCommit(5), singleCommit(1)];
		component.commits = positionedCommits;
		fixture.detectChanges();
		const lineComponents: CommitLineComponent[] = fixture.debugElement
			.queryAll(By.directive(CommitLineComponent))
			.map((it) => it.componentInstance);
		expect(lineComponents[0].positionsCount).toEqual(6);
		expect(lineComponents[1].positionsCount).toEqual(6);
		expect(lineComponents[2].positionsCount).toEqual(6);
	});

	describe('calculates transitions', () => {
		it('with same position branch parent', () => {
			const c = commitWithParents(1, [1]);
			const b = singleCommit(0);
			const a = c.parents[0];
			component.commits = [c, b, a];
			fixture.detectChanges();
			const lineComponents: CommitLineComponent[] = fixture.debugElement
				.queryAll(By.directive(CommitLineComponent))
				.map((it) => it.componentInstance);
			expect(lineComponents[0].transitions).toEqual([]);
			expect(lineComponents[1].transitions).toEqual([1]);
			expect(lineComponents[2].transitions).toEqual([]);
		});

		it('with different position branch parent', () => {
			const c = commitWithParents(1, [3]);
			const b = singleCommit(0);
			const a = c.parents[0];
			component.commits = [c, b, a];
			fixture.detectChanges();
			const lineComponents: CommitLineComponent[] = fixture.debugElement
				.queryAll(By.directive(CommitLineComponent))
				.map((it) => it.componentInstance);
			expect(lineComponents[0].transitions).toEqual([]);
			expect(lineComponents[1].transitions).toEqual([1]);
			expect(lineComponents[2].transitions).toEqual([]);
		});

		it('with same position branch parent and different position merge parent', () => {
			const d = commitWithParents(1, [1, 3]);
			const c = singleCommit(0);
			const b = d.parents[0];
			const a = d.parents[1];
			component.commits = [d, c, b, a];
			fixture.detectChanges();
			const lineComponents: CommitLineComponent[] = fixture.debugElement
				.queryAll(By.directive(CommitLineComponent))
				.map((it) => it.componentInstance);
			expect(lineComponents[0].transitions).toEqual([]);
			expect(lineComponents[1].transitions).toEqual([1, 3]);
			expect(lineComponents[2].transitions).toEqual([3]);
			expect(lineComponents[3].transitions).toEqual([]);
		});
	});
});

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
