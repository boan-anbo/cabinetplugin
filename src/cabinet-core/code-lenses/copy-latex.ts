import { CabinetCardIdentifier, Card } from 'cabinet-node';
import * as vscode from 'vscode';
import { cabinetNodeInstance } from '../../extension';


/**
 * CodelensProvider
 */
export class CopyLatexCodeLensProvider implements vscode.CodeLensProvider {

    private codeLenses: vscode.CodeLens[] = [];
    private regex: RegExp;
    private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

    constructor() {
        this.regex = CabinetCardIdentifier.CCI_PATTERN;

        vscode.workspace.onDidChangeConfiguration((_) => {
            this._onDidChangeCodeLenses.fire();
        });
    }

    public provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {

        if (vscode.workspace.getConfiguration("cabinetplugin").get("enableCodeLens", true)) {
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
                    this.codeLenses.push(new vscode.CodeLens(range));
                }
            }
            return this.codeLenses;
        }
        return [];
    }

    public resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken) {
        const editor = vscode.window.activeTextEditor;

        if (editor) {
            let document = editor.document;

            // Get the document text
            const documentText = document.getText(codeLens.range);

            // Get the card identifier
            const cci = CabinetCardIdentifier.fromCciMarker(documentText);

            if (!cci) {
                return;
            }

            const cardId = cci.id;


            if (cci && vscode.workspace.getConfiguration("cabinetplugin").get("enableCodeLens", true)) {
                codeLens.command = {
                    title: 'Latex',
                    tooltip: "Copy latex snippet",
                    command: "cabinetplugin.copyLatex",
                    arguments: [
                        cardId,
                        codeLens.range]
                };
                return codeLens;
            }
        }

        return null;
    }
}

export function copyLatexCommand(cardId: string, range: vscode.Range) {


    const card = cabinetNodeInstance?.getCardById(cardId);
    if (!card) {
        return;
    }

    const citeKey = card.source?.uniqueId ?? "";
    const pageIndex = card.source?.pageIndex ?? "";

    const latexSnippet = `\\autocite[][pageIndex]{${citeKey}}`;

    // copy to clipboard
    const clipboard = vscode.env.clipboard;
    clipboard.writeText(latexSnippet);

    // show message
    vscode.window.showInformationMessage(`Latex snippet copied to clipboard.`);

}

export const copyLatexCodeLensProvider = new CopyLatexCodeLensProvider();