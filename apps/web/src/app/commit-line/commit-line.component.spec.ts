import { Commit, Person } from '@amelie-git/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PositionedCommit } from '../repository/positioned-commit';
import { CommitLineComponent } from './commit-line.component';

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
	});

	it('shows a commit subject', () => {
		const commit = new PositionedCommit(
			0,
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
		component.positionedCommit = commit;
		fixture.detectChanges();
		expect(fixture.debugElement.nativeElement.textContent).toContain('commit subject');
	});
});
