import { CabinetCardIdentifier, CabinetNode } from 'cabinet-node';

import * as vscode from 'vscode';
import { showSearchInputBox } from './dialogs/show-search-cards-input';

export const cardLookupProvider = (cabinetNode: CabinetNode): vscode.Disposable => {
	const testPattern = /{(.+)}/;
	let hover = vscode.languages.registerHoverProvider({ scheme: '*', language: '*' }, {
		provideHover(document, position, token) {
			if (!cabinetNode) {
				vscode.window.showInformationMessage('Cabinet is not started.');
				return;
			}
			const hoveredWord = document.getText(document.getWordRangeAtPosition(position, /{{.+}}/));

			console.log(hoveredWord);

			const captured = hoveredWord.match(testPattern);
			console.log(captured)

			if (captured === null || captured.length < 2) {
				return;
			}

			const cci = CabinetCardIdentifier.fromJsonString(captured[1]);


					var markdownString = new vscode.MarkdownString();
			if (cci && cabinetNode !== undefined) {
				const card = cabinetNode.getCardByCci(cci);
				if (card) {
					console.log(card.toMarkdown());
					markdownString.appendMarkdown(card.toMarkdown());

				} else {

					markdownString.appendMarkdown(`[Card not found] \`${cci.id}.\``);
				}
				return {
					contents: [markdownString]
				};

			}
		}
	});
	return hover;

}