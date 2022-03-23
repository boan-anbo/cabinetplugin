import * as vscode from 'vscode';
import { WritingPlan } from 'writing-plan';
import { WritingPlanOptions } from 'writing-plan/build/main/lib/entities/writing-plan-options';
import { getCurrentPlan, getSectionByRange, getSectionParent, writingPlans } from '../writing-plan-instance';
import { getNavigationCodeLenses } from './get-section-navigation-lenses';


/**
 * CodelensProvider
 */
export class SectionCodeLensProvider implements vscode.CodeLensProvider {

    private codeLenses: vscode.CodeLens[] = [];
    private regex: RegExp;
    private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

    constructor() {
        this.regex = new WritingPlanOptions().getMarkerRegex();

        vscode.workspace.onDidChangeConfiguration((_) => {
            this._onDidChangeCodeLenses.fire();
        });
    }

    public provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {

        if (vscode.workspace.getConfiguration("writing-plan").get("enableCodeLens", true)) {
            this.codeLenses = [];
            const regex = new RegExp(this.regex);
            const text = document.getText();
            let matches;
            while ((matches = regex.exec(text)) !== null) {
                const line = document.lineAt(document.positionAt(matches.index).line);
                const indexOf = line.text.indexOf(matches[0]);
                const position = new vscode.Position(line.lineNumber, indexOf);
                const range = document.getWordRangeAtPosition(position, new RegExp(this.regex));

                if (range) {

                    const section = getSectionByRange(range);
                    if (!section) {
                        return [];
                    }

                    // get text at range
                    const marker = document.getText(range);
                    const isCloseMarker = getCurrentPlan().isCloseMarker(marker);

                    // section header = 
                    // generate header with #
                    const header = Array.from({ length: section.level + 1 }, (x, i) => i).map(i => '#').join('');
                    this.codeLenses.push(new vscode.CodeLens(range, {
                        title: `${isCloseMarker ? '<' : '>'} ${header} [${section.order + 1}]`,
                        tooltip: '',
                        command: '',
                    }));


                    // give navigation buttons only to open markers to lessen visual pollution. The close marker can be used to jump to the beginning to use the navigation buttons
                    if (!isCloseMarker) {
                        const navigationLenses = getNavigationCodeLenses(range, section);
                        this.codeLenses.push(...navigationLenses);
                    }


                    this.codeLenses.push(new vscode.CodeLens(range));
                }
            }
            return this.codeLenses;
        }
        return [];
    }

    public async resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken) {
        const editor = vscode.window.activeTextEditor;

        const section = getSectionByRange(codeLens.range);

        if (editor && section) {
            const title = `T: ${section?.wordTarget} | C: ${section?.wordCount} | B: ${section.wordBalance}${section?.title ? (' | ' + section.title) : ''} `;
            codeLens.command = {
                title,
                tooltip: `Jump to Section Beginning: ${section.title ?? section.marker}`,
                command: 'writing-plan.goToLine',
                arguments: [
                    section?.markerOpenLine,
                ]
            };
            return codeLens;
        }

        return null;
    }
}


export const sectionCodeLensProvider = new SectionCodeLensProvider();