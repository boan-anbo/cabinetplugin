import * as vscode from 'vscode';
/**
 * Shows an input box using window.showInputBox().
 */
 export async function showSearchInputBox() {
	const result = await vscode.window.showInputBox({
		value: '',
		// valueSelection: [2, 4],
		placeHolder: 'Type in a search query',
		validateInput: text => {
			// vscode.window.showInformationMessage(`Validating: ${text}`);
			// return text === '123' ? 'Not 123!' : null;
            return text.length > 2 ? null : 'Search query must be at least 3 characters long';
		}
	});
	// vscode.window.showInformationMessage(`Search: ${result}`);
    return result;
}