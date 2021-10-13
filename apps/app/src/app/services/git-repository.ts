import { Branch, Commit, CommitFile, Person, Repository } from '@amelie-git/core';
import { spawn } from 'child_process';
import { Change, diffLines } from 'diff';

export class GitRepository implements Repository {
	commits: Commit[] = [];
	branches: Branch[] = [];

	private commonArgs: string[];

	constructor(public readonly path: string, public readonly gitFolder?: string) {
		this.commonArgs = gitFolder ? ['--git-dir', gitFolder] : [];
	}

	async open(): Promise<void> {
		this.commits = await this.log();
		this.branches = await this.getBranches();
	}

	async getCommitFiles(commit: Commit): Promise<CommitFile[]> {
		const data = await git(
			this.path,
			...this.commonArgs,
			'diff-tree',
			'--no-commit-id',
			'--name-only',
			'--root',
			'-r',
			commit.id
		);
		return data
			.trim()
			.split('\n')
			.map((line) => new CommitFile(commit, line));
	}

	async getDiff(commitFileA: CommitFile, commitFileB: CommitFile): Promise<Change[]> {
		const fileAContents = commitFileA
			? await git(this.path, ...this.commonArgs, 'show', `${commitFileA.commit.id}:${commitFileA.path}`)
			: '';
		const fileBContents = commitFileB
			? await git(this.path, ...this.commonArgs, 'show', `${commitFileB.commit.id}:${commitFileB.path}`)
			: '';
		return diffLines(fileAContents, fileBContents);
	}

	private async log(): Promise<Commit[]> {
		const data = await git(
			this.path,
			...this.commonArgs,
			'log',
			'--topo-order',
			'--date',
			'iso8601-strict',
			'--pretty=full',
			'--parents'
		);
		const lines = data.trim().split('\n');
		return splitToCommits(lines).map(parseCommitLines);
	}

	private async getBranches(): Promise<Branch[]> {
		const data = await git(this.path, ...this.commonArgs, 'branch');
		const lines = data.trim().split('\n');
		return lines.map(parseBranchLine);
	}
}

async function git(cwd: string, ...args: string[]): Promise<string> {
	return new Promise((resolve, reject) => {
		const process = spawn('git', args, { cwd });
		let result = '';
		let error = '';
		process.stdout.on('data', (data) => (result += data));
		process.stderr.on('data', (data) => (error += data));
		process.on('exit', (code) => {
			if (code != 0) {
				reject(new Error(`Failed with code ${code} (${error.trim()}).`));
			} else {
				resolve(result);
			}
		});
	});
}

function splitToCommits(lines: string[]): string[][] {
	const commitStartLines = lines.reduce((result, line, i) => {
		if (line.startsWith('commit ')) {
			return [...result, i];
		} else {
			return result;
		}
	}, []);

	return commitStartLines.map((startLine, i) => lines.slice(startLine, commitStartLines[i + 1]));
}

function parseCommitLines(lines: string[]): Commit {
	const ids = findKeywordValue(lines, 'commit')?.split(' ');
	const [id, ...parentIds] = ids || [];
	const author = parsePerson(findKeywordValue(lines, 'Author:'));
	const committer = parsePerson(findKeywordValue(lines, 'Commit:'));
	const messageStartLine = lines.indexOf('');
	const name = lines[messageStartLine + 1].trim();
	const message = lines
		.slice(messageStartLine + 3)
		.map((it) => it.trim())
		.join('\n')
		.trim();
	return new Commit(id, name, message, author, committer, parentIds);
}

function findKeywordValue(lines: string[], keyword: string): string {
	const line = lines.find((line) => line.startsWith(keyword + ' '));
	return line.substr(keyword.length + 1);
}

function parsePerson(nameMail: string): Person {
	if (!nameMail) {
		return null;
	}
	const authorRegex = /^(.*) <(.*)>$/;
	const [, name, mail] = nameMail.match(authorRegex) || [];
	return new Person(name, mail);
}

function parseBranchLine(line: string): Branch {
	if (line.startsWith('*')) {
		line = line.substr(1);
	}
	return new Branch(line.trim());
}
