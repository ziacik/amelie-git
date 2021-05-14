import { Commit, CommitFile } from '@amelie-git/core';
import { waitFor } from '@amelie-git/testing';
import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatTreeModule } from '@angular/material/tree';
import { By } from '@angular/platform-browser';
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
		const commitFiles = [new CommitFile(null, '/path/to/file1'), new CommitFile(null, '/path/to/file2')];
		component.commitFiles = commitFiles;
		fixture.detectChanges();
		expect(fixture.debugElement.nativeElement.textContent).toContain('path/to');
		expect(fixture.debugElement.nativeElement.textContent).toContain('file1');
		expect(fixture.debugElement.nativeElement.textContent).toContain('file2');
	});

	it('converts the list of commit files to a sorted, reduced tree', () => {
		const commitFiles = [
			new CommitFile(null, '/file0'),
			new CommitFile(null, '/another/fileD'),
			new CommitFile(null, '/path/fileA'),
			new CommitFile(null, '/path/to/some/fileB'),
			new CommitFile(null, '/path/to/some/fileC'),
		];
		component.commitFiles = commitFiles;

		expect(component.rootNode.children.map((node) => node.name)).toEqual(['another', 'path', 'file0']);
		expect(component.rootNode.children[0].children.map((node) => node.name)).toEqual(['fileD']);
		expect(component.rootNode.children[1].children.map((node) => node.name)).toEqual(['to/some', 'fileA']);
		expect(component.rootNode.children[1].children[0].children.map((node) => node.name)).toEqual(['fileB', 'fileC']);
		expect(component.rootNode.children.map((node) => node.file)).toEqual([undefined, undefined, commitFiles[0]]);
		expect(component.rootNode.children[0].children.map((node) => node.file)).toEqual([commitFiles[1]]);
		expect(component.rootNode.children[1].children.map((node) => node.file)).toEqual([undefined, commitFiles[2]]);
		expect(component.rootNode.children[1].children[0].children.map((node) => node.file)).toEqual([
			commitFiles[3],
			commitFiles[4],
		]);
	});

	it('does not reduce into root', () => {
		const commitFiles = [new CommitFile(null, '/path/to/some/fileB'), new CommitFile(null, '/path/to/some/fileC')];
		component.commitFiles = commitFiles;
		expect(component.rootNode.name).toEqual('.');
		expect(component.rootNode.children.map((node) => node.name)).toEqual(['path/to/some']);
		expect(component.rootNode.children[0].children.map((node) => node.name)).toEqual(['fileB', 'fileC']);
		expect(component.rootNode.children[0].children.map((node) => node.file)).toEqual(commitFiles);
	});

	it('triggers a selection event when a commit line is selected', async () => {
		const commit = new Commit('commit-id', 'a commit', '', null, null, []);
		const commitFiles = [new CommitFile(commit, '/path/to/some/fileB'), new CommitFile(commit, '/path/to/some/fileC')];
		component.commitFiles = commitFiles;

		const fileElement: DebugElement = fixture.debugElement.query(By.css('.file'));
		const fileSelected = await waitFor(component.selectionChange, () => {
			fileElement.nativeElement.click();
			fixture.detectChanges();
		});

		expect(fileSelected).toEqual(commitFiles[0]);
	});

	it('marks a node as selected when a commit line is selected', async () => {
		const commit = new Commit('commit-id', 'a commit', '', null, null, []);
		const commitFiles = [new CommitFile(commit, '/path/to/some/fileB'), new CommitFile(commit, '/path/to/some/fileC')];
		component.commitFiles = commitFiles;

		const fileElement: DebugElement = fixture.debugElement.query(By.css('.file'));
		fileElement.nativeElement.click();
		fixture.detectChanges();

		expect(component.treeControl.dataNodes.map((it) => it.selected)).toEqual([false, true, false]);
	});

	it('unmarks other node as selected when a another commit line is selected', async () => {
		const commit = new Commit('commit-id', 'a commit', '', null, null, []);
		const commitFiles = [new CommitFile(commit, '/path/to/some/fileB'), new CommitFile(commit, '/path/to/some/fileC')];
		component.commitFiles = commitFiles;

		const fileElement: DebugElement = fixture.debugElement.query(By.css('.file'));
		fileElement.nativeElement.click();
		fixture.detectChanges();

		const anotherFileElement: DebugElement = fixture.debugElement.queryAll(By.css('.file'))[1];
		anotherFileElement.nativeElement.click();
		fixture.detectChanges();

		expect(component.treeControl.dataNodes.map((it) => it.selected)).toEqual([false, false, true]);
	});
});
