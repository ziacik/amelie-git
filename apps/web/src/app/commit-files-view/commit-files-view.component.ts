import { CommitFile } from '@amelie-git/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Input } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { CommitFileFlatNode } from './commit-file-flat-node';
import { CommitFileTreeNode } from './commit-file-tree-node';

@Component({
	selector: 'app-commit-files-view',
	templateUrl: './commit-files-view.component.html',
	styleUrls: ['./commit-files-view.component.css'],
})
export class CommitFilesViewComponent {
	rootNode: CommitFileTreeNode;

	private _commitFiles: CommitFile[];

	get commitFiles(): CommitFile[] {
		return this._commitFiles;
	}

	@Input() set commitFiles(value: CommitFile[]) {
		this._commitFiles = value;
		this.calculateTree();
		this.rootNode.reduce();
		this.dataSource.data = this.rootNode.children;
		this.treeControl.expandAll();
	}

	private transformer: (node: CommitFileTreeNode, level: number) => CommitFileFlatNode = (
		node: CommitFileTreeNode,
		level: number
	) => ({
		expandable: !!node.children && node.children.length > 0,
		name: node.name,
		level: level,
	});

	private treeFlattener = new MatTreeFlattener(
		this.transformer,
		(node) => node.level,
		(node) => node.expandable,
		(node) => node.children
	);

	treeControl = new FlatTreeControl<CommitFileFlatNode>(
		(node) => node.level,
		(node) => node.expandable
	);

	dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

	hasChild(_: number, node: CommitFileFlatNode): boolean {
		return node.expandable;
	}

	private calculateTree(): void {
		this.rootNode = new CommitFileTreeNode('.');

		for (const file of this.commitFiles) {
			const unrootedPath = file.path.startsWith('/') ? file.path.substr(1) : file.path;
			const pathParts = unrootedPath.split('/');
			let currentLevelNodes = this.rootNode.children;
			for (const pathPart of pathParts) {
				const existingNode: CommitFileTreeNode = currentLevelNodes.find((it) => it.name === pathPart);

				if (existingNode) {
					currentLevelNodes = existingNode.children;
				} else {
					const newNode = new CommitFileTreeNode(pathPart);
					currentLevelNodes.push(newNode);
					currentLevelNodes = newNode.children;
				}
			}
		}
	}
}
