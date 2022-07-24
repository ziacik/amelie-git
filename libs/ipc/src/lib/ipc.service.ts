import { Branch, Commit, CommitFile, NULL_PERSON, Person } from '@amelie-git/core';
import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root',
})
export class IpcService {
	constructor() {
		Neutralino.init();
	}

	async openRepository(): Promise<string | undefined> {
		const path = await Neutralino.os.showFolderDialog('Open git repository');
		const gitResult = await Neutralino.os.execCommand(`git -C "${path}" status`);
		checkError(gitResult);
		return path;
	}

	async getLog(path: string): Promise<Commit[]> {
		const gitResult = await Neutralino.os.execCommand(
			`git -C "${path}" log --topo-order --date iso8601-strict --pretty=full --parents`
		);

		checkError(gitResult);
		return splitToCommits(splitLines(gitResult.stdOut)).map(parseCommitLines);
	}

	async getBranches(path: string): Promise<Branch[]> {
		const gitResult = await Neutralino.os.execCommand(
			`git -C "${path}" for-each-ref --format='%(refname:short)' refs/heads/`
		);

		checkError(gitResult);
		return splitLines(gitResult.stdOut).filter(Boolean).map(parseBranchLine);
	}

	async getCommitFiles(path: string, commit: Commit): Promise<CommitFile[]> {
		const gitResult = await Neutralino.os.execCommand(
			`git -C "${path}" diff-tree --no-commit-id --name-only --root -r ${commit.id}`
		);

		checkError(gitResult);
		return splitLines(gitResult.stdOut).map((line) => new CommitFile(commit, line));
	}
}

function splitLines(text: string) {
	return text.trim().split('\n');
}

function checkError(result: Neutralino.os.ExecCommandResult) {
	if (result.exitCode !== 0) {
		throw new Error('Git error: ' + result.stdErr);
	}
}

function splitToCommits(lines: string[]): string[][] {
	const commitStartLines = lines.reduce((result: number[], line: string, i: number) => {
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
	const line = lines.find((line) => line.startsWith(keyword + ' ')) || '';
	return line.substring(keyword.length + 1);
}

function parsePerson(nameMail: string): Person {
	if (!nameMail) {
		return NULL_PERSON;
	}
	const authorRegex = /^(.*) <(.*)>$/;
	const [, name, mail] = nameMail.match(authorRegex) || [];
	return new Person(name, mail);
}

function parseBranchLine(line: string): Branch {
	return new Branch(line.trim());
}
