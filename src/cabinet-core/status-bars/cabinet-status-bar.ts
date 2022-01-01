import * as vscode from 'vscode';
let myStatusBarItem: vscode.StatusBarItem;


export const registerStatusBar = () => {
	myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 200);
};

export const updateStatusBarItem = (newStatus: string): void => {
	if (newStatus.length > 0) {
		myStatusBarItem.text = `[C] ${newStatus}`;
		myStatusBarItem.show();
	}
}

export const removeStatusBarItem = (): void => {
	myStatusBarItem.dispose();
}