import { Position } from "vscode";
import * as vscode from "vscode";
import { InsertOption } from "../types/insert-option";


export const insertText = async (text: string, opt?: InsertOption) => {

    if (!vscode.window.activeTextEditor && opt?.focusFirstEditorGroup) {

        await vscode.commands.executeCommand("workbench.action.focusFirstEditorGroup");
    }

    const editor = vscode.window.activeTextEditor;







    if (editor) {

        editor?.edit((textEditorEdit) => {
            if (opt?.firstLineText && opt.firstLineText.length > 0) {
                textEditorEdit.insert(new Position(editor.selection.active.line, editor.selection.active.character), opt.firstLineText);
            }
        });
    }

    if (opt?.linesBefore) {
        for (let index = 0; index < opt?.linesBefore; index++) {
            await vscode.commands.executeCommand("editor.action.insertLineAfter");
        }
    }

    if (editor) {
        editor?.edit((textEditorEdit) => {
            if (opt?.select) {
                textEditorEdit.replace(editor.selection, text);
            } else {
                textEditorEdit.insert(new Position(editor.selection.active.line, editor.selection.active.character), text);
            }

        });
    }

    if (opt?.linesAfter) {
        for (let index = 0; index < opt.linesAfter; index++) {
            await vscode.commands.executeCommand("editor.action.insertLineAfter");
        }
    }

}