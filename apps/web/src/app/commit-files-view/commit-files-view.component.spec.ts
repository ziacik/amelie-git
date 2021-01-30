import { CommitFile } from '@amelie-git/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommitFilesViewComponent } from './commit-files-view.component';

describe('CommitFilesViewComponent', () => {
	let component: CommitFilesViewComponent;
	let fixture: ComponentFixture<CommitFilesViewComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [CommitFilesViewComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(CommitFilesViewComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('shows a list of commit files', () => {
		const commitFiles = [
			new CommitFile('/path/to/file1'),
			new CommitFile('/path/to/file2')
		];
		component.commitFiles = commitFiles;
		fixture.detectChanges();
		expect(fixture.debugElement.nativeElement.textContent).toContain('/path/to/file1');
		expect(fixture.debugElement.nativeElement.textContent).toContain('/path/to/file2');
	});
});
