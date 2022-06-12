import { WritingPlan } from 'writing-plan';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { sectionCodeLensProvider } from './codelens/section-codelens';
import { documentPlanListener } from './plan-listener';
import { createStatusBar } from './writing-plan-bar';
import { goToLine } from './go-to-line';
import { cursorChangeHighlightListener } from './cursor-change-listener';
import { WritingPlanOutlineTree } from './writing-plan-outline/writing-plan-outline-tree';
import { registerSectionDecorations } from './decorators/section-annotator';
import { registerCursorDecorations } from './decorators/cursor-annotator';
import { copySkeletonPlanToVscodeClipboard, writeSkeletonCopyIntoNewFile } from './commands/get-skeleton-copy';
import { WritingPlanTreeItem } from './entities/writing-plan-tree-item';
import { writingPlanInstance } from './writing-plan-instance';
import { hideOutlineCards, showOutlineCards, toggleOutlineShowCards } from './writing-plan-outline/toggle-outline-show-cards';
import { writeCurrentDocumentIntoAnotherFile } from './utils/replace-wiki-citations';

export let writingPlanTreeView: WritingPlanOutlineTree | undefined = undefined;

export const globalWritingPlanDisposables: vscode.Disposable[] = [];
export const registerWritingPlan = (context: vscode.ExtensionContext) => {

	const goToLineCommandSub = vscode.commands.registerCommand("cabinetplugin.writing-plan.goToLine", goToLine);
	context.subscriptions.push(goToLineCommandSub);

	// register a listener to watch for any changes to the current document in the active editor using the onDidChangeTextDocument api
	// this will trigger the codelens to update
	context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(documentPlanListener));

	context.subscriptions.push(vscode.languages.registerCodeLensProvider("*", sectionCodeLensProvider));
	// attach a listener to watch cursor position changes
	context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(cursorChangeHighlightListener));

	writingPlanInstance.refreshCurrentPlan();

	createStatusBar();



	const disposables: vscode.Disposable[] = [];
	writingPlanTreeView = new WritingPlanOutlineTree(context);

	if (writingPlanTreeView) {
		vscode.commands.registerCommand('writing-plan.outline.moveSectionUp', writingPlanTreeView.moveSectionUp);
		vscode.commands.registerCommand('writing-plan.outline.moveSectionDown', writingPlanTreeView.moveSectionDown);
	}
	// create function to reveal the tree view item
	// register actions for writing plan outline items
	// register copy skeleton copy command
	disposables.push(vscode.commands.registerCommand('writing-plan.copySkeleton', copySkeletonPlanToVscodeClipboard));
	// register write skeleton copy into new file command
	disposables.push(vscode.commands.registerCommand('writing-plan.writeSkeleton', writeSkeletonCopyIntoNewFile));
	// register a command to comment all section markers
	disposables.push(vscode.commands.registerCommand('writing-plan.commentAllSectionMarkers', async () => {
		await writingPlanInstance.commentAllSectionMarkers();
	}));
	// register a command to uncomment all section markers
	disposables.push(vscode.commands.registerCommand('writing-plan.uncommentAllSectionMarkers', () => {
		writingPlanInstance.uncommentAllSectionMarkers();
	}));
	// register toggle cards on outline
	disposables.push(vscode.commands.registerCommand('writing-plan.outline.showCards', showOutlineCards));
	disposables.push(vscode.commands.registerCommand('writing-plan.outline.hideCards', hideOutlineCards));
	// register replace all markdown notes command
	disposables.push(vscode.commands.registerCommand('writing-plan.processor.replaceMarkdownNotes', async () => {
		await writeCurrentDocumentIntoAnotherFile();
	}));

	// register section decorators
	registerSectionDecorations(context);
	// registor cursor decorators
	registerCursorDecorations(context);
	// 

	// register a listener for when the active editor switches to another document
	disposables.push(vscode.window.onDidChangeActiveTextEditor(() => {
		if (writingPlanInstance) {
			writingPlanInstance.refreshCurrentPlan();
		}
	}));

	console.log('Writing Plan Inititated');

	context.subscriptions.push(...disposables);

	context.subscriptions.push(...globalWritingPlanDisposables);

	writingPlanInstance.refreshCurrentPlan();
};