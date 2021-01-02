import { Branch, Commit, Person } from '@amelie-git/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { AppComponent } from './app.component';
import { BranchViewComponent } from './branch-view/branch-view.component';
import { CommitLineComponent } from './commit-line/commit-line.component';
import { ElectronService } from './electron.service';
import { LogViewComponent } from './log-view/log-view.component';
import { RepositoryService } from './repository.service';
import { StartPageComponent } from './start-page/start-page.component';

describe('AppComponent', () => {
	let commits: Commit[];
	let branches: Branch[];
	let fixture: ComponentFixture<AppComponent>;
	let repositoryService: RepositoryService;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [NoopAnimationsModule, MatListModule, MatIconModule, MatSidenavModule],
			providers: [RepositoryService, ElectronService],
			declarations: [AppComponent, LogViewComponent, CommitLineComponent, BranchViewComponent, StartPageComponent],
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
		branches = [new Branch('master'), new Branch('slave')];
		repositoryService = TestBed.inject(RepositoryService);
		jest.spyOn(repositoryService, 'getLog').mockReturnValue(of(commits));
		jest.spyOn(repositoryService, 'getBranches').mockReturnValue(of(branches));
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

		it('requests a list of branches for that repository', () => {
			expect(repositoryService.getBranches).toHaveBeenCalledWith('/path/selected');
		});

		it('hides the start page', () => {
			fixture.detectChanges();
			const startPage = fixture.debugElement.query(By.directive(StartPageComponent));
			expect(startPage).toBeFalsy();
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
		});

		describe('when the list of branches is retrieved', () => {
			beforeEach(() => {
				fixture.detectChanges();
			});

			it('shows them in a branch view', () => {
				const branchView = <BranchViewComponent>(
					fixture.debugElement.query(By.directive(BranchViewComponent))?.componentInstance
				);
				expect(branchView).toBeDefined();

				const branchesInView = branchView.branches;
				expect(branchesInView).toEqual(branches);
			});
		});
	});
});
