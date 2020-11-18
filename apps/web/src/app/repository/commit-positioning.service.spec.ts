import { Commit } from '@amelie-git/core';
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
			const commits = [commit('c', ['b', 'a']), commit('b', ['a']), commit('a')];
			const positionedCommits = service.position(commits);
			const positions = positionedCommits.map((it) => it.position);
			expect(positions).toEqual([0, 1, 0]);
		});

		it('two merges of two branches', () => {
			const commits = [
				commit('e', ['d', 'c']),
				commit('d', ['c']),
				commit('c', ['b', 'a']),
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
				commit('e', ['d', 'c', 'b']),
				commit('d', ['b']),
				commit('c', ['b']),
				commit('b', ['a']),
				commit('a'),
			];
			const positionedCommits = service.position(commits);
			const positions = positionedCommits.map((it) => it.position);
			expect(positions).toEqual([0, 1, 2, 0, 0]);
		});
	});

	it('sets correct positioned parents', () => {
		const commits = [
			commit('e', ['d', 'c', 'b']),
			commit('d', ['b']),
			commit('c', ['b']),
			commit('b', ['a']),
			commit('a'),
		];
		const [e, d, c, b, a] = service.position(commits);
		expect(e.parents).toEqual([d, c, b]);
		expect(d.parents).toEqual([b]);
		expect(c.parents).toEqual([b]);
		expect(b.parents).toEqual([a]);
		expect(a.parents).toEqual([]);
	});

	it('sets correct transitional commits (i.e. the commits for which vertical lines should be drawn at those positions)', () => {
		const commits = [
			commit('e', ['d', 'c', 'b']),
			commit('d', ['b']),
			commit('c', ['b']),
			commit('b', ['a']),
			commit('a'),
		];
		const [e, d, c, b, a] = service.position(commits);
		expect(e.transitions).toEqual([e, e, e]);
		expect(d.transitions).toEqual([e, e, e]);
		expect(c.transitions).toEqual([e, undefined, e]);
		expect(b.transitions).toEqual([e]);
		expect(a.transitions).toEqual([b]);
	});
});

function commit(id: string, parentIds: string[] = []): Commit {
	return new Commit(id, id, null, null, null, parentIds);
}
