export class Person {
	constructor(public readonly name: string, public readonly email: string) {}
}

export const NULL_PERSON = new Person('', '');
