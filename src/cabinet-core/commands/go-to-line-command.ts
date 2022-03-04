import { CabinetNode } from "cabinet-node"

import * as vscode from "vscode";
import { showInsertCardsMd } from "../dialogs/show-insert-cards-md";
import { showSearchInputBox } from "../dialogs/show-search-cards-input";
import { insertText } from "../utils/insert-text";


// jump to line in current active editor
export function goToLine(line: number) {


    const editor = vscode.window.activeTextEditor;
    if (editor) {

        const position = new vscode.Position(line, 0);
        editor.selection = new vscode.Selection(position, position);
        editor.revealRange(new vscode.Range(position, position));
    }



}