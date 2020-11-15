import { Commit, Person, Repository } from '@amelie-git/core';
import * as fs from 'fs';
import { CommitObject, log, ReadCommitResult } from 'isomorphic-git';

export class IsoRepository implements Repository {
	readonly commits: Commit[];

	constructor(public readonly path: string) {
		this.commits = [];
	}

	async open(): Promise<void> {
		const isoCommits = await log({ fs, dir: this.path });
		this.commits.splice(0, this.commits.length);
		this.commits.push(...isoCommits.map((isoCommit) => this.adaptCommit(isoCommit)));
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
}
