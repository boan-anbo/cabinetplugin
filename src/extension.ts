// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

import { CabinetNode } from 'cabinet-node';
import * as vscode from 'vscode';
import { cardsCompletionProvider } from './cabinet-core/cards-completion-provider';

import { cardLookupProvider } from './cabinet-core/card-lookup';
import { searchCardsCommand } from './cabinet-core/commands/search-cards-command';
import { cabinetPreviewPanel, showPreview, showPreviewCommand } from './cabinet-core/webviews/preview-panel';
import { CabinetNodeApi } from './api/cabinet-node-api';
import path = require('path');
import fs = require('fs');
import { markdownChangePreviewListener, stopChangePreviewListener } from './cabinet-core/liseners/mardown-change-preview-listener';
import { CabinetApi } from 'cabinet-node/build/main/lib/card-client';
import { fetchCardsFromApiCommand } from './cabinet-core/commands/fetch-cci-cards-from-api';
import { registerStatusBar, removeStatusBarItem, updateStatusBarItem } from './cabinet-core/status-bars/cabinet-status-bar';
import { pullMarkdownCodeLensProvider, pullMarkdownCommand } from './cabinet-core/code-lenses/pull-markdown-codelens-provider';
import { insertText } from './cabinet-core/utils/insert-text';
import { openSourceCodeLensProvider, openSourceCommand } from './cabinet-core/code-lenses/open-source-codelens-provider';
import { CabinetNotesProvider } from './treeviews/cabinetnotes-provider';
import { goToLineCommand } from './cabinet-core/commands/go-to-line-command';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

export let cabinetNodeInstance: CabinetNode | undefined;

async function loadCabinetNode() {


	const workspaces = vscode.workspace.workspaceFolders;
	if (!workspaces) {
		vscode.window.showErrorMessage('No workspace folder is opened.');
		return;
	}
	const folderUri = workspaces[0].uri;


	const filePathToCreate = path.join(folderUri.fsPath, 'cabinet.json');

	if (!fs.existsSync(filePathToCreate)) {

		const result = await vscode.window
			.showInformationMessage(
				`${filePathToCreate} does not exist. Do you want to create it?`,
				...["Yes", "No"]
			);

		if (result === "Yes") {
			cabinetNodeInstance = new CabinetNode(folderUri.fsPath, 'cabinet.json');

			return cabinetNodeInstance;
		} else {
			vscode.window.showInformationMessage('No cabinet.json file found. Cabinet is not started.');
			return;
		}
	} else {
		cabinetNodeInstance = new CabinetNode(folderUri.fsPath, 'cabinet.json');

		return cabinetNodeInstance;
	}



}

let disposables: vscode.Disposable[] = [];

let cabinetNodeApi: CabinetNodeApi;

async function initCabinetNodeApi(cabinetNode: CabinetNode | undefined) {
	if (!cabinetNode) {
		vscode.window.showErrorMessage('Api needs Cabinet instance first.');
		return;
	}

	cabinetNodeApi = new CabinetNodeApi(cabinetNode);
}


export async function activate(context: vscode.ExtensionContext) {

	// vscode.window.registerTreeDataProvider(
	// 	'cabinetCards',
	// 	new CabinetNotesProvider()
	//   );

	// context.subscriptions.push(cardsCompletionProvider(cabinetNodeInstance));


	vscode.commands.registerCommand("cabinetplugin.enableCodeLens", () => {
		vscode.workspace.getConfiguration("cabinetplugin").update("enableCodeLens", true, true);
	});

	vscode.commands.registerCommand("cabinetplugin.disableCodeLens", () => {
		vscode.workspace.getConfiguration("cabinetplugin").update("enableCodeLens", false, true);
	});

	vscode.commands.registerCommand("cabinetplugin.codelensAction", (args: any) => {
		vscode.window.showInformationMessage(`CodeLens action clicked with args=${args}`);
	});

	stopCabinet();









	let stopCabinetCmd = vscode.commands.registerCommand('cabinetplugin.stopCabinet', async () => {
		stopCabinet();
	});


	context.subscriptions.push(stopCabinetCmd);

	let startCabinet = vscode.commands.registerCommand('cabinetplugin.startCabinet', () => {
		// vscode.window.showInformationMessage('Hello World from Cabinet!');
		if (cabinetNodeInstance !== undefined) {
			vscode.window.showInformationMessage('Cabinet is already running!');
			return;
		}
		loadCabinetNode();


		if (cabinetNodeInstance !== undefined) {

			// cabinet outline;
			const cabinetNodeOutlineProvider = new CabinetNotesProvider();
			vscode.window.createTreeView('cabinetOutline', {
				treeDataProvider: cabinetNodeOutlineProvider
			});

			vscode.window.createTreeView('nodeDependencies',{
				treeDataProvider: new CabinetNotesProvider()

			} );


			vscode.commands.registerCommand("cabinetOutline.goToLine", goToLineCommand);

			vscode.commands.registerCommand('cabinetOutline.refresh', () => cabinetNodeOutlineProvider.refresh());

			const outlineRefreshListener = vscode.workspace.onDidChangeTextDocument(() => {
				vscode.commands.executeCommand('cabinetOutline.refresh');
			});

			disposables.push(outlineRefreshListener);

			// register codelens providers.
			vscode.languages.registerCodeLensProvider("*", pullMarkdownCodeLensProvider);

			vscode.commands.registerCommand("cabinetplugin.pullMarkdown", pullMarkdownCommand);

			vscode.languages.registerCodeLensProvider("*", openSourceCodeLensProvider);

			vscode.commands.registerCommand("cabinetplugin.openSource", openSourceCommand);

			// others

			registerStatusBar();

			(cabinetNodeInstance as CabinetNode).onCabinetFileChangeLoaded = updateCurrentCards;

			console.log('Starting cabinet...');

			initCabinetNodeApi(cabinetNodeInstance);

			// search cards command
			context.subscriptions.push();
			context.subscriptions.push(
				vscode.commands.registerCommand('cabinetplugin.searchCards', searchCardsCommand(cabinetNodeInstance))
			);

			context.subscriptions.push(cardLookupProvider(cabinetNodeInstance));

			context.subscriptions.push(showPreviewCommand(cabinetNodeInstance));

			context.subscriptions.push(
				vscode.commands.registerCommand('cabinetplugin.fetchCardsFromApi', fetchCardsFromApiCommand(cabinetNodeInstance))
			);


			vscode.workspace.onDidChangeTextDocument(markdownChangePreviewListener);

			const cabinetJsonFile = (cabinetNodeInstance as CabinetNode).ccjFilename;
			const cardCount = (cabinetNodeInstance as CabinetNode).cardCount;
			vscode.window.showInformationMessage(`Started: ${cardCount} cards loaded from ${cabinetJsonFile}.`);

			updateCurrentCards();

		}

	});
	context.subscriptions.push(startCabinet);

}

// standard cabinet node.
export const updateCurrentCards = (cardsNum?: string, filePath?: string) => {
	if (!cardsNum && cabinetNodeInstance) {
		cardsNum = cabinetNodeInstance?.cardCount.toString();
	}

	if (cardsNum) {
		updateStatusBarItem(`${cardsNum} cards.`);
	}
}

// this method is called when your extension is deactivated
export async function deactivate() {

	await stopCabinet();

	disposables.forEach(disposable => disposable.dispose());

	disposables = [];
}


export const stopCabinet = async () => {
	if (cabinetNodeInstance) {
		cabinetNodeInstance = undefined;
		await cabinetNodeApi.stopServer();
		vscode.window.showInformationMessage('Cabinet stopped.');
		await stopChangePreviewListener();
		await removeStatusBarItem();
	}
}