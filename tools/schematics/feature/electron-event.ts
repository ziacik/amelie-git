import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

export function addElectronEvent(name: string): Rule {
	return (tree: Tree, _context: SchematicContext) => {
		const path = 'apps/app/src/app/events/electron.events.ts';
		const contents = tree.read(path);
		if (contents != null) {
			const newContents = eventTemplate(name);
			tree.overwrite(path, contents + '\n' + newContents);
		}
		return tree;
	};
}

function eventTemplate(name: string) {
	return `ipcMain.handle('get-${name}', async (_event, path: string) => {
	const repository = new IsoRepository(path);
	await repository.open();
	return repository.${name};
});
`;
}
