import { Position, Range, Selection, TextEditorRevealType, window, workspace } from "vscode";

export async function goToLine(line: number, index?: number, documentUri?: string) {

    let editor = undefined;

    if (!documentUri) {

        editor = window.activeTextEditor;
    } else {
        // searching in visible editors
        editor = window.visibleTextEditors.find(e => e.document.uri.toString() === documentUri);
        if (!editor) {
            // open document in a new editor
            const doc = await workspace.openTextDocument(documentUri);
            // show the editor with the doc
            editor = await window.showTextDocument(doc);
        }
    }

    if (editor) {

        const position = new Position(line, index ?? 0);
        editor.selection = new Selection(position, position);
        editor.revealRange(new Range(position, position), TextEditorRevealType.InCenterIfOutsideViewport);
    }
    return;
}