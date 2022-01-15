import { CommitFile } from '@amelie-git/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { CommitFileFlatNode } from './commit-file-flat-node';
import { CommitFileTreeNode } from './commit-file-tree-node';

@Component({
	selector: 'app-commit-files-view',
	templateUrl: './commit-files-view.component.html',
	styleUrls: ['./commit-files-view.component.css'],
})
export class CommitFilesViewComponent {
	rootNode: CommitFileTreeNode = new CommitFileTreeNode('');

	@Output() selectionChange: EventEmitter<CommitFile> = new EventEmitter();

	private commitFilesValue: CommitFile[] = [];

	get commitFiles(): CommitFile[] {
		return this.commitFilesValue;
	}

	@Input() set commitFiles(value: CommitFile[]) {
		this.commitFilesValue = value;
		this.calculateTree();
		this.rootNode.reduce();
		this.dataSource.data = this.rootNode.children;
		this.treeControl.expandAll();
	}

	private transformer(node: CommitFileTreeNode, level: number): CommitFileFlatNode {
		return {
			expandable: !!node.children && node.children.length > 0,
			name: node.name,
			file: node.file,
			level: level,
			selected: false,
		};
	}

	private readonly treeFlattener = new MatTreeFlattener(
		this.transformer,
		(node) => node.level,
		(node) => node.expandable,
		(node) => node.children
	);

	readonly treeControl = new FlatTreeControl<CommitFileFlatNode>(
		(node) => node.level,
		(node) => node.expandable
	);

	readonly dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

	hasChild(_: number, node: CommitFileFlatNode): boolean {
		return node.expandable;
	}

	private calculateTree(): void {
		this.rootNode = new CommitFileTreeNode('.');

		for (const file of this.commitFiles) {
			const unrootedPath = file.path.startsWith('/') ? file.path.substr(1) : file.path;
			const pathParts = unrootedPath.split('/');
			let currentLevelNodes = this.rootNode.children;
			for (const [i, pathPart] of pathParts.entries()) {
				const existingNode: CommitFileTreeNode | undefined = currentLevelNodes.find((it) => it.name === pathPart);

				if (existingNode) {
					currentLevelNodes = existingNode.children;
				} else {
					const isLeaf = i === pathParts.length - 1;
					const newNode = new CommitFileTreeNode(pathPart, isLeaf ? file : undefined);
					currentLevelNodes.push(newNode);
					currentLevelNodes = newNode.children;
				}
			}
		}
	}

	toggleSelection(node: CommitFileFlatNode): void {
		this.selectionChange.emit(node.file);
		this.deselectAllNodes();
		node.selected = true;
	}

	private deselectAllNodes(): void {
		this.treeControl.dataNodes.forEach((node) => (node.selected = false));
	}
}
