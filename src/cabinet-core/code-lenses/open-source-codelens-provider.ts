import { CabinetCardIdentifier, Card } from 'cabinet-node';
import { execFile } from 'child_process';
import * as vscode from 'vscode';
import { cabinetNodeInstance } from '../../extension';
import * as fs from 'fs';


/**
 * CodelensProvider
 */
export class OpenSourceCodeLensProvider implements vscode.CodeLensProvider {

    private codeLenses: vscode.CodeLens[] = [];
    private regex: RegExp;
    private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

    constructor() {
        // this.regex = /(.+)/g;
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
                const documentText = document.getText(range);

                const cci = CabinetCardIdentifier.fromCciMarker(documentText);
                if (cci) {

                    const card = cabinetNodeInstance?.getCardByCci(cci);

                    if (range && card?.source?.filePath) {
                        this.codeLenses.push(new vscode.CodeLens(range));
                    }
                }
            }
            return this.codeLenses;
        }
        return [];
    }

    public async resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken) {
        const editor = vscode.window.activeTextEditor;

        if (editor) {
            let document = editor.document;

            // Get the document text
            const documentText = document.getText(codeLens.range);

            // Get the card identifier
            const cci = CabinetCardIdentifier.fromCciMarker(documentText);

            if (cci) {

                const card = cabinetNodeInstance?.getCardByCci(cci);

                if (card?.source?.filePath && vscode.workspace.getConfiguration("cabinetplugin").get("enableCodeLens", true)) {
                    codeLens.command = {
                        title: 'Open Source',
                        tooltip: `Open ${card.source.filePath}`,
                        command: "cabinetplugin.openSource",
                        arguments: [card.id]
                    };
                    return codeLens;
                }
            }

            codeLens.command = {
                title: '',
                tooltip: `No file`,
                command: '',
                arguments: []
            };
            return codeLens;



        }

        return null;
    }
}

export function openSourceCommand(cardId: string) {

    const card = cabinetNodeInstance?.getCardById(cardId);
    if (!card) {
        return;
    }

    // insert markdown to the range in current editor
    // card.openFile(`C:\\Program Files (x86)\\Foxit Software\\Foxit PhantomPDF\\FoxitPDFEditor.exe`);

    const readerExecutable = `C:\\Program Files (x86)\\Foxit Software\\Foxit PhantomPDF\\FoxitPDFEditor.exe`;
    const filePath = card?.source?.filePath;
    // check if filePath exists
    if (!filePath || !fs.existsSync(filePath)) {
        throw new Error('File path is not set\n' + filePath);
    }

    execFile(readerExecutable, [
        filePath,
        "/A",
        card.source?.pageIndex ? "page=" + card.source.pageIndex : "",
    ])

}

export const openSourceCodeLensProvider = new OpenSourceCodeLensProvider();