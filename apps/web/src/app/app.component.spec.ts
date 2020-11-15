import { Commit, Person } from '@amelie-git/core';
import { TestBed } from '@angular/core/testing';
import { MatListModule } from '@angular/material/list';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { AppComponent } from './app.component';
import { ElectronService } from './electron.service';
import { LogViewComponent } from './log-view/log-view.component';
import { RepositoryService } from './repository.service';

describe('AppComponent', () => {
	let commits: Commit[];

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [MatListModule],
			providers: [RepositoryService, ElectronService],
			declarations: [AppComponent, LogViewComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		commits = [
			new Commit(
				'id',
				'first-commit',
				'first-message',
				new Person('Amélie', 'amelie@mail'),
				new Person('Amélie', 'amelie@mail'),
				[]
			),
		];
		const repositoryService = TestBed.inject(RepositoryService);
		jest.spyOn(repositoryService, 'getLog').mockReturnValue(of(commits));
	});

	it('should create the app', () => {
		const fixture = TestBed.createComponent(AppComponent);
		const app = fixture.componentInstance;
		expect(app).toBeTruthy();
	});

	it(`should have as title 'Amelie Git'`, () => {
		const fixture = TestBed.createComponent(AppComponent);
		const app = fixture.componentInstance;
		expect(app.title).toEqual('Amelie Git');
	});

	it('should render title', () => {
		const fixture = TestBed.createComponent(AppComponent);
		fixture.detectChanges();
		const compiled = fixture.nativeElement;
		expect(compiled.querySelector('h1').textContent).toContain('Amelie Git');
	});

	it('gets a log from repository and shows them in a log view', () => {
		const fixture = TestBed.createComponent(AppComponent);
		fixture.detectChanges();
		const logView = fixture.debugElement.query(By.directive(LogViewComponent))?.componentInstance;
		expect(logView).toBeDefined();
		expect(logView.commits).toEqual(commits);
	});
});
