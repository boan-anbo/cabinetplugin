import * as vscode from 'vscode';
import { WritingPlan } from 'writing-plan';
import { WritingPlanOptions } from 'writing-plan/build/main/lib/entities/writing-plan-options';
import { writingPlanInstance } from '../writing-plan-instance';
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
            const plan = writingPlanInstance.getCurrentPlan();
            if (!plan) {
                return [];
            }
            while ((matches = regex.exec(text)) !== null) {
                const line = document.lineAt(document.positionAt(matches.index).line);
                const indexOf = line.text.indexOf(matches[0]);
                const position = new vscode.Position(line.lineNumber, indexOf);
                const range = document.getWordRangeAtPosition(position, new RegExp(this.regex));

                if (range) {

                    const section = writingPlanInstance.getSectionByRange(range);
                    if (!section) {
                        return [];
                    }
                    // get text at range
                    const marker = document.getText(range);
                    const isCloseMarker = plan.isCloseMarker(marker);

                    const sectionItem = writingPlanInstance.allCurrentSectionItems.find(item => item.section.id === section.id);
                    const prefixIndentLength = sectionItem?.sectionLevelOrderString.length ?? 0;
                    const adjustedRange = new vscode.Range(
                        new vscode.Position(range.start.line, range.start.character + prefixIndentLength),
                        new vscode.Position(range.end.line, range.end.line === range.start.line ? range.end.character + prefixIndentLength : range.end.character)
                    );

                    // if it's open marker, add a button to jump to end

                    const jumpLabel = ` ${section.title ? section.title : section.wordTargetActual} `;
                    if (!isCloseMarker) {
                        this.codeLenses.push(new vscode.CodeLens(adjustedRange, {
                            title: jumpLabel + ` ▼ `,
                            tooltip: `Jump to close marker`,
                            command: 'cabinetplugin.writing-plan.goToLine',
                            arguments: [
                                section?.markerCloseLine,
                            ]
                        }));
                    } else {
                        this.codeLenses.push(new vscode.CodeLens(adjustedRange, {
                            title: jumpLabel + ` ▲ `,
                            tooltip: `Go to open marker`,
                            command: 'cabinetplugin.writing-plan.goToLine',
                            arguments: [
                                section?.markerOpenLine,
                                section?.markerOpenEndIndex + 1,
                            ]
                        }));
                    }

                    // give navigation buttons only to open markers to lessen visual pollution. The close marker can be used to jump to the beginning to use the navigation buttons
                    // if (!isCloseMarker) {
                    const navigationLenses = getNavigationCodeLenses(range, section);
                    this.codeLenses.push(...navigationLenses);

                }
            }
            return this.codeLenses;
        }
        return [];
    }

    public async resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken) {
        const editor = vscode.window.activeTextEditor;

        const section = writingPlanInstance.getSectionByRange(codeLens.range);

        // this is taken over by annotator
        // if (editor && section) {
        //     const title = `T: ${section?.wordTarget} | C: ${section?.wordCount} | B: ${section.wordBalance}${section?.title ? (' | ' + section.title) : ''} `;
        //     codeLens.command = {
        //         title,
        //         tooltip: `Jump to Section Beginning: ${section.title ?? section.marker}`,
        //         command: 'writing-plan.goToLine',
        //         arguments: [
        //             section?.markerOpenLine,
        //         ]
        //     };
        //     return codeLens;
        // }
        return codeLens;

        return null;
    }
}


export const sectionCodeLensProvider = new SectionCodeLensProvider();