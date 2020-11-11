import { Person } from './person';

describe('Person', () => {
	it('can be created', () => {
		const person = new Person("Amélie Poulain", "amelie@mail");
		expect(person.name).toEqual("Amélie Poulain");
		expect(person.email).toEqual("amelie@mail");
	});
});
