import { Commit, Person } from '@amelie-git/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatListModule } from '@angular/material/list';
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
		const positionedCommits = [
			new PositionedCommit(
				0,
				new Commit(
					'id',
					'first-commit',
					'first-message',
					new Person('Amélie', 'amelie@mail'),
					new Person('Amélie', 'amelie@mail'),
					[]
				),
				[],
				[]
			),
		];
		component.commits = positionedCommits;
		fixture.detectChanges();
		expect(fixture.debugElement.nativeElement.textContent).toContain('first-commit');
	});
});
