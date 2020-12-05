import { Commit, Person } from '@amelie-git/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatListModule } from '@angular/material/list';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { AppComponent } from './app.component';
import { CommitLineComponent } from './commit-line/commit-line.component';
import { ElectronService } from './electron.service';
import { LogViewComponent } from './log-view/log-view.component';
import { RepositoryService } from './repository.service';
import { StartPageComponent } from './start-page/start-page.component';

describe('AppComponent', () => {
	let commits: Commit[];
	let fixture: ComponentFixture<AppComponent>;
	let repositoryService: RepositoryService;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [MatListModule],
			providers: [RepositoryService, ElectronService],
			declarations: [AppComponent, LogViewComponent, CommitLineComponent, StartPageComponent],
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
		repositoryService = TestBed.inject(RepositoryService);
		jest.spyOn(repositoryService, 'getLog').mockReturnValue(of(commits));
		fixture = TestBed.createComponent(AppComponent);
		fixture.detectChanges();
	});

	it('should create the app', () => {
		const app = fixture.componentInstance;
		expect(app).toBeTruthy();
	});

	it('shows a start page at first and not a log view', () => {
		const startPage = fixture.debugElement.query(By.directive(StartPageComponent));
		const logView = fixture.debugElement.query(By.directive(LogViewComponent));
		expect(startPage).toBeTruthy();
		expect(logView).toBeFalsy();
	});

	describe('when user opens a repository', () => {
		beforeEach(() => {
			const startPage = <StartPageComponent>(
				fixture.debugElement.query(By.directive(StartPageComponent))?.componentInstance
			);
			startPage.repositoryOpened.emit('/path/selected');
		});

		it('requests a log for that repository', () => {
			expect(repositoryService.getLog).toHaveBeenCalledWith('/path/selected');
		});

		describe('when the log is retrieved', () => {
			beforeEach(() => {
				fixture.detectChanges();
			});

			it('converts the received commits to positioned commits and shows them in a log view', () => {
				const logView = <LogViewComponent>fixture.debugElement.query(By.directive(LogViewComponent))?.componentInstance;
				expect(logView).toBeDefined();

				const positionedCommits = logView.commits;
				const commitsFromPositionedCommits = positionedCommits.map((it) => it.commit);

				expect(commitsFromPositionedCommits).toEqual(commits);
			});

			it('does not show start page', () => {
				const startPage = fixture.debugElement.query(By.directive(StartPageComponent));
				expect(startPage).toBeFalsy();
			});
		});
	});
});
