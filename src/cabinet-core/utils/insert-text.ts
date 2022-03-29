import { Position } from "vscode";
import * as vscode from "vscode";
import { InsertOption } from "../types/insert-option";
import { Card } from "cabinet-node";

export const insertCardCci = async (cards: Card[], providedOpt?: InsertOption) => {
    for await (const card of cards) {
        const opt = providedOpt ?? {
            linesBefore: 1,
            linesAfter: 1,
        } as InsertOption;
        const cci = card.getCci().toCciMarker();
        await insertText(cci, opt);
    }
    return;
};

export const insertText = async (text: string, opt?: InsertOption, line?: number) => {

    if (!vscode.window.activeTextEditor && opt?.focusFirstEditorGroup) {

        await vscode.commands.executeCommand("workbench.action.focusFirstEditorGroup");
    }

    const editor = vscode.window.activeTextEditor;

    if (editor) {

        await editor?.edit((textEditorEdit) => {
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
        await editor?.edit((textEditorEdit) => {
            if (opt?.select) {
                textEditorEdit.replace(editor.selection, text);
            } else {
                const lineToInsert = line ?? editor.selection.active.line;
                textEditorEdit.insert(new Position(lineToInsert, editor.selection.active.character), text);
            }

        });
    }

    if (opt?.linesAfter && opt?.linesAfter > 0) {
        for (let index = 0; index < opt.linesAfter; index++) {
            await vscode.commands.executeCommand("editor.action.insertLineAfter");
        }
    }
    return;

}

