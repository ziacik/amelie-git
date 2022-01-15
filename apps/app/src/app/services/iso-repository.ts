import { Branch, Commit, CommitFile, NULL_COMMIT_FILE, Person, Repository } from '@amelie-git/core';
import { Change, diffLines } from 'diff';
import * as fs from 'fs';
import {
	CommitObject,
	listBranches,
	log,
	readBlob,
	ReadCommitResult,
	TREE,
	walk,
	WalkerEntry,
	WalkerMap,
} from 'isomorphic-git';
import { resolve } from 'path';

export class IsoRepository implements Repository {
	readonly commits: Commit[];
	readonly branches: Branch[];

	private readonly gitdir: string;

	constructor(public readonly path: string, gitFolder = '.git') {
		this.commits = [];
		this.branches = [];
		this.gitdir = resolve(path, gitFolder);
	}

	async open(): Promise<void> {
		const isoCommits = (await log({ fs, gitdir: this.gitdir, dir: this.path })) || [];
		this.commits.splice(0, this.commits.length);
		this.commits.push(...isoCommits.map((isoCommit) => this.adaptCommit(isoCommit)));

		const isoBranches = (await listBranches({ fs, gitdir: this.gitdir, dir: this.path })) || [];
		this.branches.splice(0, this.branches.length);
		this.branches.push(...isoBranches.map((isoBranch) => this.adaptBranch(isoBranch)));
	}

	private adaptCommit(isoCommit: ReadCommitResult): Commit {
		const id = isoCommit.oid;
		const messageSplit = isoCommit.commit.message.split('\n', 3);
		const name = messageSplit[0].trim();
		const message = messageSplit[1]?.trim() + messageSplit[2]?.trim();
		const author = this.adaptPerson(isoCommit.commit.author);
		const committer = this.adaptPerson(isoCommit.commit.committer);
		return new Commit(id, name, message, author, committer, isoCommit.commit.parent);
	}

	private adaptPerson(author: CommitObject['author']): Person {
		const name = author.name;
		const email = author.email;
		return new Person(name, email);
	}

	private adaptBranch(isoBranch: string): Branch {
		return new Branch(isoBranch);
	}

	async getCommitFiles(commit: Commit): Promise<CommitFile[]> {
		const ourCommitTree = TREE({ ref: commit.id });
		/// We'll only take the first parent (branch parent) so even merge commits are compared to their single previous commit on a branch.
		const parentTrees = commit.parentIds.slice(0, 1).map((parentId) => TREE({ ref: parentId }));

		const trees = [ourCommitTree, ...parentTrees];

		const map: WalkerMap = async function (fileName, entriesOrNull: WalkerEntry[] | null) {
			const entries = entriesOrNull ?? [];
			const entryTypes = await Promise.all(entries.map((entry) => entry?.type()));
			const fileEntries = entries.map((entry, i) => (entryTypes[i] === 'blob' ? entry : undefined));
			const [ourEntry, parentEntry] = fileEntries;

			if (!ourEntry && !parentEntry) {
				return {};
			}

			if (!ourEntry) {
				return { fullpath: fileName };
			}

			if (!parentEntry) {
				return { fullpath: fileName };
			}

			const contents = await Promise.all(entries.map((entry) => entry.content()));

			if (equal(contents[0] as Uint8Array, contents[1] as Uint8Array)) {
				return null;
			}

			return { fullpath: fileName };
		};

		// Get a list of the files that changed
		const results = await walk({
			fs,
			gitdir: this.gitdir,
			dir: this.path,
			trees,
			map,
		});

		return results
			.filter((it: { fullpath: string }) => it.fullpath)
			.map((result: { fullpath: string }) => new CommitFile(commit, result.fullpath));
	}

	async getDiff(commitFileA: CommitFile, commitFileB: CommitFile): Promise<Change[]> {
		const [blobA, blobB] = await Promise.all([
			commitFileA !== NULL_COMMIT_FILE
				? readBlob({ fs, gitdir: this.gitdir, dir: this.path, oid: commitFileA.commit.id, filepath: commitFileA.path })
				: Promise.resolve({ blob: new Uint8Array() }),
			commitFileB !== NULL_COMMIT_FILE
				? readBlob({ fs, gitdir: this.gitdir, dir: this.path, oid: commitFileB.commit.id, filepath: commitFileB.path })
				: Promise.resolve({ blob: new Uint8Array() }),
		]);
		const textA = Buffer.from(blobA.blob).toString('utf8');
		const textB = Buffer.from(blobB.blob).toString('utf8');
		return diffLines(textA, textB);
	}
}

function equal(buf1: Uint8Array, buf2: Uint8Array): boolean {
	if (buf1.byteLength != buf2.byteLength) return false;
	for (let i = 0; i != buf1.byteLength; i++) {
		if (buf1[i] != buf2[i]) return false;
	}
	return true;
}
