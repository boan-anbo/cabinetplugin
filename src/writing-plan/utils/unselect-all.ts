import { Selection, window } from "vscode";

export const unselectAll = (): void => {
    // remove all the multi-line selections
    const editor = window.activeTextEditor;

    if (editor) {

        const position = editor.selection.end;
        editor.selection = new Selection(position, position);
    }

}