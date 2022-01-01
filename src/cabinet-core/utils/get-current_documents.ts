import { Position } from "vscode";
import * as vscode from "vscode";
import { cabinetNodeInstance } from "../../extension";
import { Card } from "cabinet-node";

export interface InsertOption {
    select?: boolean
    linesAfter?: number
}

export const getCurrentCards =  (): Card[] |null => {
    const editor = vscode.window.activeTextEditor;


    // Get the document last line.
    if (editor) {
        const doc = editor.document.getText();

        console.log('GOot doc', doc);
        const cards = cabinetNodeInstance?.getAllCardsByCciFromText(doc);
        return cards ?? [];
    }
    return null;
}