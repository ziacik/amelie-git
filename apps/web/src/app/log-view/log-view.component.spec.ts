import { Commit, Person } from '@amelie-git/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatListModule } from '@angular/material/list';
import { LogViewComponent } from './log-view.component';

describe('LogViewComponent', () => {
	let component: LogViewComponent;
	let fixture: ComponentFixture<LogViewComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [MatListModule],
			declarations: [LogViewComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(LogViewComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('shows a list of commits', () => {
		const commits = [
			new Commit(
				'id',
				'first-commit',
				'first-message',
				new Person('Amélie', 'amelie@mail'),
				new Person('Amélie', 'amelie@mail'),
				[]
			),
		];
		component.commits = commits;
		fixture.detectChanges();
		expect(fixture.debugElement.nativeElement.textContent).toContain('first-commit');
	});
});
