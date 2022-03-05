import { CabinetNode } from "cabinet-node"

import * as vscode from "vscode";
import { showInsertCardsMd } from "../dialogs/show-insert-cards-md";
import { showSearchInputBox } from "../dialogs/show-search-cards-input";
import { insertText } from "../utils/insert-text";


// jump to line in current active editor
export async function goToLine(line: number, documentUri?: string) {

    let editor = undefined;

    if (!documentUri) {

        editor = vscode.window.activeTextEditor;
    } else {
        // searching in visible editors
        editor = vscode.window.visibleTextEditors.find(e => e.document.uri.toString() === documentUri);
        if (!editor) {
            // open document in a new editor
            const doc = await vscode.workspace.openTextDocument(documentUri)
            // show the editor with the doc
            editor = await vscode.window.showTextDocument(doc);
        }
    }

    if (editor) {

        const position = new vscode.Position(line, 0);
        editor.selection = new vscode.Selection(position, position);
        editor.revealRange(new vscode.Range(position, position));
    }



}