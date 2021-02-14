import { CommitFile } from '@amelie-git/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatTreeModule } from '@angular/material/tree';
import { CommitFilesViewComponent } from './commit-files-view.component';

describe('CommitFilesViewComponent', () => {
	let component: CommitFilesViewComponent;
	let fixture: ComponentFixture<CommitFilesViewComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [MatTreeModule, MatIconModule],
			declarations: [CommitFilesViewComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(CommitFilesViewComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('shows a list of commit files', () => {
		const commitFiles = [new CommitFile('/path/to/file1'), new CommitFile('/path/to/file2')];
		component.commitFiles = commitFiles;
		fixture.detectChanges();
		expect(fixture.debugElement.nativeElement.textContent).toContain('path/to');
		expect(fixture.debugElement.nativeElement.textContent).toContain('file1');
		expect(fixture.debugElement.nativeElement.textContent).toContain('file2');
	});

	it('converts the list of commit files to a sorted, reduced tree', () => {
		const commitFiles = [
			new CommitFile('/file0'),
			new CommitFile('/another/fileD'),
			new CommitFile('/path/fileA'),
			new CommitFile('/path/to/some/fileB'),
			new CommitFile('/path/to/some/fileC'),
		];
		component.commitFiles = commitFiles;
		expect(component.rootNode.children.map((node) => node.name)).toEqual(['another', 'path', 'file0']);
		expect(component.rootNode.children[0].children.map((node) => node.name)).toEqual(['fileD']);
		expect(component.rootNode.children[1].children.map((node) => node.name)).toEqual(['to/some', 'fileA']);
		expect(component.rootNode.children[1].children[0].children.map((node) => node.name)).toEqual(['fileB', 'fileC']);
	});

	it('does not reduce into root', () => {
		const commitFiles = [new CommitFile('/path/to/some/fileB'), new CommitFile('/path/to/some/fileC')];
		component.commitFiles = commitFiles;
		expect(component.rootNode.name).toEqual('.');
		expect(component.rootNode.children.map((node) => node.name)).toEqual(['path/to/some']);
		expect(component.rootNode.children[0].children.map((node) => node.name)).toEqual(['fileB', 'fileC']);
	});
});
