import { CommitFile, NULL_COMMIT_FILE } from '@amelie-git/core';

export class CommitFileTreeNode {
	name: string;
	file: CommitFile;
	children: CommitFileTreeNode[];

	constructor(name: string, file: CommitFile = NULL_COMMIT_FILE) {
		this.name = name;
		this.file = file;
		this.children = [];
	}

	reduce(): void {
		if (this.children.length === 0) {
			return;
		}

		if (this.mergeWithSingleChild()) {
			return;
		}

		this.sort();
		this.children.forEach((child) => child.reduce());
	}

	private mergeWithSingleChild(): boolean {
		const isRoot = this.name === '.';
		const singleChild = this.children.length === 1 ? this.children[0] : null;
		const isSingleChildLeaf = singleChild?.children?.length === 0;

		if (!isRoot && singleChild && !isSingleChildLeaf) {
			singleChild.reduce();
			this.name = this.name + '/' + singleChild.name;
			this.children = singleChild.children;
			return true;
		}

		return false;
	}

	private sort(): void {
		this.children.sort((a, b) => {
			const areSameType = !!a.children.length === !!b.children.length;
			return areSameType ? a.name.localeCompare(b.name) : a.children.length ? -1 : 1;
		});
	}
}
