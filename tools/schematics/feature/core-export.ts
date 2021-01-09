import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

export function addCoreExport(name: string): Rule {
	return (tree: Tree, _context: SchematicContext) => {
		const path = 'libs/core/src/index.ts';
		const contents = tree.read(path);
		if (contents != null) {
			const newContents = template(name);
			tree.overwrite(path, contents + newContents);
		}
		return tree;
	};
}

function template(name: string) {
	return `export * from './lib/${name}';
`;
}
