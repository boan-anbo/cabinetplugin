import { WritingPlan } from 'writing-plan';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { sectionCodeLensProvider } from './codelens/section-codelens';
import { getCurrentPlan, refreshCurrentPlan, writingPlans } from './writing-plan-instance';
import { documentPlanListener } from './plan-listener';
import { createStatusBar } from './writing-plan-bar';
import { goToLine } from './go-to-line';
import { cursorChangeHighlightListener } from './cursor-change-listener';
import { TestViewDragAndDrop } from './test-tree-view-drag-and-drop';
import { registerSectionDecorations } from './decorators/section-annotator';

export const registerWritingPlan = (context: vscode.ExtensionContext) => {

	// const planNodeProvider = new PlanNodeProvider();
	// vscode.window.registerTreeDataProvider('writing-outline', planNodeProvider);

	const goToLineCommandSub = vscode.commands.registerCommand("cabinetplugin.writing-plan.goToLine", goToLine);
	context.subscriptions.push(goToLineCommandSub);

	// register a listener to watch for any changes to the current document in the active editor using the onDidChangeTextDocument api
	// this will trigger the codelens to update
	context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(documentPlanListener));

	context.subscriptions.push(vscode.languages.registerCodeLensProvider("*", sectionCodeLensProvider));
	// attach a listener to watch cursor position changes
	context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(cursorChangeHighlightListener));

	refreshCurrentPlan();

	createStatusBar();

	const treeview = new TestViewDragAndDrop(context);

	// register actions for writing plan outline items
	vscode.commands.registerCommand('writing-plan.outline.moveSectionUp', treeview.moveSectionUp);
	vscode.commands.registerCommand('writing-plan.outline.moveSectionDown', treeview.moveSectionDown);

	// register section decorators
	registerSectionDecorations(context);

	console.log('Writing Plan Inititated');
}