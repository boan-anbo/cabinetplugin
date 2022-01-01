import { CabinetNode, CabinetCardIdentifier, Card } from 'cabinet-node';
import * as vscode from 'vscode';

export const cardsCompletionProvider = (cabinet: CabinetNode) => {
	return vscode.languages.registerCompletionItemProvider('markdown', {

		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {

			console.log(position)
			const range = new vscode.Range(
				position.line,
				position.character,
				position.line,
				position.character + 1
			); 
			return cabinet.cards.map((card: Card) => {

				const item = new vscode.CompletionItem(card.text, vscode.CompletionItemKind.Snippet);

				item.insertText = card.getCci().toJsonString();

				item.documentation = new vscode.MarkdownString(card.toMarkdown());

				item.range = range;
				return item;
			});



			// let found: RegExpMatchArray | undefined;
			// const line = document.lineAt(position.line);



			// // There may be multiple links within this line
			// const LINK_WITH_BLOCK_REGEX = /(?<entry>{(?<content>.+?)})/g;
			// const matches = line.text.matchAll(LINK_WITH_BLOCK_REGEX);
			// // console.log([...matches])
			// for (const match of [...matches]) {
			// 	console.log(match);
			// 	console.log(!match.groups || !match.index);
			// 	if (!match.groups || !match.index) continue;
			// 	const { entry, content } = match.groups;
			// 	// If the current position is within this link, then we are trying to complete it
			// 	console.log('Entire Entry', match.groups);
			// 	if (
			// 		match.index <= position.character &&
			// 		position.character <= match.index + entry.length
			// 	) {
			// 		found = match;
			// 	}
			// }

			// console.log(found);
			// if (!found) return;
			// const content = found?.groups?.content ?? '';
			// const cards = cabinet.searchLocalCards(content);

			// return [new vscode.CompletionItem('gazagoal')];

			// return cards.map(card => {
				// const markdown = card.toMarkdown();
			// 	const item = new vscode.CompletionItem(card.text);
			// 	item.kind = vscode.CompletionItemKind.Text;
			// 	item.insertText = CabinetCardIdentifier.fromCard(card).toJsonString();
			// 	item.detail = markdown;
			// 	item.documentation = markdown;
			// 	return item;
			// })

			// const line = document.lineAt(position);
			// console.log(linePrefix);
			// // a simple completion item which inserts `Hello World!`
			// const simpleCompletion = new vscode.CompletionItem('Hello World!');

			// // a completion item that inserts its text as snippet,
			// // the `insertText`-property is a `SnippetString` which will be
			// // honored by the editor.
			// const snippetCompletion = new vscode.CompletionItem('Good part of the day');
			// snippetCompletion.insertText = new vscode.SnippetString('Good ${1|morning,afternoon,evening|}. It is ${1}, right?');
			// snippetCompletion.documentation = new vscode.MarkdownString("Inserts a snippet that lets you select the _appropriate_ part of the day for your greeting.");

			// // a completion item that can be accepted by a commit character,
			// // the `commitCharacters`-property is set which means that the completion will
			// // be inserted and then the character will be typed.
			// const commitCharacterCompletion = new vscode.CompletionItem('console');
			// commitCharacterCompletion.commitCharacters = ['.'];
			// commitCharacterCompletion.documentation = new vscode.MarkdownString('Press `.` to get `console.`');

			// // a completion item that retriggers IntelliSense when being accepted,
			// // the `command`-property is set which the editor will execute after 
			// // completion has been inserted. Also, the `insertText` is set so that 
			// // a space is inserted after `new`
			// const commandCompletion = new vscode.CompletionItem('new');
			// commandCompletion.kind = vscode.CompletionItemKind.Keyword;
			// commandCompletion.insertText = 'new ';
			// commandCompletion.command = { command: 'editor.action.triggerSuggest', title: 'Re-trigger completions...' };

			// return all completion items as array
		}
	}, "{");
};
