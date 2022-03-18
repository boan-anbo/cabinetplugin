import { CabinetCardIdentifier } from 'cabinet-node';
import * as vscode from 'vscode';

export const getCardLocationsInDocument = async (document: vscode.TextDocument): Promise<[CabinetCardIdentifier, vscode.Location][]> => {

        const cardLocations: [CabinetCardIdentifier, vscode.Location][] = [];
        const regex = new RegExp(CabinetCardIdentifier.CCI_PATTERN);
        const text = document.getText();
        let matches;
        while ((matches = regex.exec(text)) !== null) {
                const line = document.lineAt(document.positionAt(matches.index).line);
                const indexOf = line.text.indexOf(matches[0]);
                const position = new vscode.Position(line.lineNumber, indexOf);
                const range = document.getWordRangeAtPosition(position, new RegExp(regex));
                if (range) {
                        // instantiate a vscode location
                        const location = new vscode.Location(document.uri, range);
                        const documentText = document.getText(range);
                        const cci = CabinetCardIdentifier.fromCciMarker(documentText);
                        if (cci) {
                                cardLocations.push([cci, location]);
                        }
                }
        }
        return cardLocations;
}

export const getCardLocationsInCurrentDocument = async (): Promise<[CabinetCardIdentifier, vscode.Location][]> => {

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
                return [];
        }
        return getCardLocationsInDocument(editor.document);
};