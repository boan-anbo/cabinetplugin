import { Position } from "vscode";
import * as vscode from "vscode";

export interface InsertOption {
    select?: boolean
    linesAfter?: number
}

export const insertText = async (text: string, opt?: InsertOption) => {
    const editor = vscode.window.activeTextEditor;


    if (opt?.linesAfter) {
        for (let index = 0; index < opt.linesAfter; index++) {
            // editor.action.insertLineAfter
            await vscode.commands.executeCommand("editor.action.insertLineAfter");
        }
    }
    // Get the document last line.
    if (editor) {
        editor?.edit(textEditorEdit => {
            if (opt?.select) {
                textEditorEdit.replace(editor.selection, text);
            } else {
                textEditorEdit.insert(new Position(editor.selection.active.line, editor.selection.active.character), text);
            }
        });
    }
}