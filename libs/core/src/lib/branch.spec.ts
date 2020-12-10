import { Branch } from './branch';

describe('Branch', () => {
	it('can be created', () => {
		const branch = new Branch('some-branch');
		expect(branch.name).toEqual('some-branch');
	});
});
