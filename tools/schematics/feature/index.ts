import { chain, externalSchematic, Rule } from '@angular-devkit/schematics';
import { addCoreExport } from './core-export';
import { addElectronEvent } from './electron-event';
import { addRepositoryFunction } from './repository-function';

export default function (schema: any): Rule {
	return chain([
		externalSchematic('@nrwl/angular', 'component', {
			name: schema.name + '-view',
			project: 'web',
		}),
		externalSchematic('@nrwl/angular', 'class', {
			name: schema.name,
			project: 'core',
		}),
		addCoreExport(schema.name),
		addRepositoryFunction(schema.name),
		addElectronEvent(schema.name),
	]);
}
