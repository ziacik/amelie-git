import { Commit, NULL_PERSON } from '@amelie-git/core';
import { TestBed } from '@angular/core/testing';
import { CommitPositioningService } from './commit-positioning.service';

describe('CommitPositioningService', () => {
	let service: CommitPositioningService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(CommitPositioningService);
	});

	describe('correct positioning of', () => {
		it('single commit', () => {
			const commits = [commit('a')];
			const positionedCommits = service.position(commits);
			expect(positionedCommits[0].position).toEqual(0);
		});

		it('two commits on a branch', () => {
			const commits = [commit('b', ['a']), commit('a')];
			const positionedCommits = service.position(commits);
			const positions = positionedCommits.map((it) => it.position);
			expect(positions).toEqual([0, 0]);
		});

		it('two branches', () => {
			const commits = [commit('c', ['a']), commit('b', ['a']), commit('a')];
			const positionedCommits = service.position(commits);
			const positions = positionedCommits.map((it) => it.position);
			expect(positions).toEqual([0, 1, 0]);
		});

		it('merge of two branches', () => {
			const commits = [commit('c', ['a', 'b']), commit('b', ['a']), commit('a')];
			const positionedCommits = service.position(commits);
			const positions = positionedCommits.map((it) => it.position);
			expect(positions).toEqual([0, 1, 0]);
		});

		it('two merges of two branches', () => {
			const commits = [
				commit('e', ['c', 'd']),
				commit('d', ['c']),
				commit('c', ['a', 'b']),
				commit('b', ['a']),
				commit('a'),
			];
			const positionedCommits = service.position(commits);
			const positions = positionedCommits.map((it) => it.position);
			expect(positions).toEqual([0, 1, 0, 1, 0]);
		});

		it('three branches', () => {
			const commits = [commit('d', ['a']), commit('c', ['a']), commit('b', ['a']), commit('a')];
			const positionedCommits = service.position(commits);
			const positions = positionedCommits.map((it) => it.position);
			expect(positions).toEqual([0, 1, 2, 0]);
		});

		it('overlapping merges', () => {
			const commits = [
				commit('e', ['b', 'c', 'd']),
				commit('d', ['b']),
				commit('c', ['b']),
				commit('b', ['a']),
				commit('a'),
			];
			const positionedCommits = service.position(commits);
			const positions = positionedCommits.map((it) => it.position);
			expect(positions).toEqual([0, 2, 1, 0, 0]);
		});

		it('criss-cross merges', () => {
			const commits = [
				commit('e', ['b', 'd']),
				commit('d', ['b', 'c']),
				commit('c', ['a']),
				commit('b', ['a']),
				commit('a'),
			];
			const positionedCommits = service.position(commits);
			const positions = positionedCommits.map((it) => it.position);
			expect(positions).toEqual([0, 1, 2, 0, 2]);
		});
	});

	it('sets correct positioned parents', () => {
		const commits = [
			commit('e', ['b', 'c', 'd']),
			commit('d', ['b']),
			commit('c', ['b']),
			commit('b', ['a']),
			commit('a'),
		];
		const [e, d, c, b, a] = service.position(commits);
		expect(e.parents).toEqual([b, c, d]);
		expect(d.parents).toEqual([b]);
		expect(c.parents).toEqual([b]);
		expect(b.parents).toEqual([a]);
		expect(a.parents).toEqual([]);
	});

	it('sets correct positioned children', () => {
		const commits = [
			commit('e', ['b', 'c', 'd']),
			commit('d', ['b']),
			commit('c', ['b']),
			commit('b', ['a']),
			commit('a'),
		];
		const [e, d, c, b, a] = service.position(commits);
		expect(e.children).toEqual([]);
		expect(d.children).toEqual([e]);
		expect(c.children).toEqual([e]);
		expect(b.children).toEqual([e, d, c]);
		expect(a.children).toEqual([b]);
	});
});

function commit(id: string, parentIds: string[] = []): Commit {
	return new Commit(id, id, '', NULL_PERSON, NULL_PERSON, parentIds);
}
