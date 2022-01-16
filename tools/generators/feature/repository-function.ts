import { Rule, SchematicContext, SchematicsException, Tree } from '@angular-devkit/schematics';
import { getSourceNodes, InsertChange, insertImport } from '@nrwl/workspace/src/utils/ast-utils';
import { classify } from '@nrwl/workspace/src/utils/strings';
import * as ts from 'typescript';

export function addRepositoryFunction(name: string): Rule {
	return (tree: Tree, _context: SchematicContext) => {
		const path = 'apps/web/src/app/repository.service.ts';
		const contents = tree.read(path);
		const sourceFile = ts.createSourceFile(path, contents.toString(), ts.ScriptTarget.Latest, true);
		const nodes = getSourceNodes(sourceFile);

		const declarationRecorder = tree.beginUpdate(path);

		const repositoryFunctionChange = createRepositoryFunctionForInjection(path, name, nodes);
		const importChange = insertImport(sourceFile, path, classify(name), `@amelie-git/core`, false) as InsertChange;

		declarationRecorder.insertLeft(importChange.pos, importChange.toAdd);
		declarationRecorder.insertLeft(repositoryFunctionChange.pos, repositoryFunctionChange.toAdd);

		tree.commitUpdate(declarationRecorder);

		return tree;
	};
}

function createRepositoryFunctionForInjection(path, name: string, nodes: ts.Node[]): InsertChange {
	const classNode = nodes.find((n) => n.kind === ts.SyntaxKind.ClassKeyword);

	if (!classNode) {
		throw new SchematicsException(`expected class in ${path}`);
	}

	let siblings = classNode.parent.getChildren();
	const classIndex = siblings.indexOf(classNode);

	siblings = siblings.slice(classIndex);

	const classIdentifierNode = siblings.find((n) => n.kind === ts.SyntaxKind.Identifier);

	if (!classIdentifierNode) {
		throw new SchematicsException(`expected class in ${path} to have an identifier`);
	}

	// Find opening curly braces (FirstPunctuation means '{' here).
	const curlyNodeIndex = siblings.findIndex((n) => n.kind === ts.SyntaxKind.FirstPunctuation);

	siblings = siblings.slice(curlyNodeIndex);

	const listNode = siblings.find((n) => n.kind === ts.SyntaxKind.SyntaxList);

	if (!listNode) {
		throw new SchematicsException(`expected first class in ${path} to have a body`);
	}

	const classifiedName = classify(name);

	const toAdd = `
	get${classifiedName}(pathToRepository: string): Observable<${classifiedName}[]> {
		return this.electronService.invoke('get-${name}', pathToRepository);
	}
`;
	return new InsertChange(path, listNode.end + 1, toAdd);
}
