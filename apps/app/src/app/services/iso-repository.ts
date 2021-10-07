import { Branch, Commit, CommitFile, Person, Repository } from '@amelie-git/core';
import * as fs from 'fs';
import { CommitObject, listBranches, log, ReadCommitResult, statusMatrix, TREE, walk, WalkerEntry } from 'isomorphic-git';

export class IsoRepository implements Repository {
	readonly commits: Commit[];
	readonly branches: Branch[];

	private readonly cache: Record<string, unknown>;

	constructor(public readonly path: string) {
		this.commits = [];
		this.branches = [];
		this.cache = {};
	}

	async open(): Promise<void> {
		console.log('OPEN');
		console.time('open 1');
		const isoCommits = (await log({ fs, dir: this.path, cache: this.cache })) || [];
		console.timeEnd('open 1');
		this.commits.splice(0, this.commits.length);
		this.commits.push(...isoCommits.map((isoCommit) => this.adaptCommit(isoCommit)));

		console.time('open 2');
		const isoBranches = (await listBranches({ fs, dir: this.path })) || [];
		console.timeEnd('open 2');
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
		await this.test();

		console.time('gcf');

		const ourCommitTree = TREE({ ref: commit.id });
		/// We'll only take the first parent (branch parent) so even merge commits are compared to their single previous commit on a branch.
		const parentTrees = commit.parentIds.slice(0, 1).map((parentId) => TREE({ ref: parentId }));

		const trees = [ourCommitTree, ...parentTrees];

		// Get a list of the files that changed
		const results = await walk({
			fs,
			dir: this.path,
			cache: this.cache,
			trees,
			map: async function (fileName, entries: WalkerEntry[]) {
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
			},
		});

		console.timeEnd('gcf');

		console.log(this.cache);

		return results
			.filter((it: { fullpath: string }) => it.fullpath)
			.map((result: { fullpath: string }) => new CommitFile(result.fullpath));
	}

	private async test(): Promise<void> {
		console.time(`time elapsed`);
		const matrix = await statusMatrix({ fs, dir: this.path, cache: this.cache });
		// for (const [filepath, head, workdir, stage] of matrix) {
		// 	console.log(`${filepath}: ${head} ${workdir} ${stage}`);
		// }
		console.timeEnd(`time elapsed`);
	}
}

function equal(buf1: Uint8Array, buf2: Uint8Array): boolean {
	if (buf1.byteLength != buf2.byteLength) return false;
	for (let i = 0; i != buf1.byteLength; i++) {
		if (buf1[i] != buf2[i]) return false;
	}
	return true;
}
