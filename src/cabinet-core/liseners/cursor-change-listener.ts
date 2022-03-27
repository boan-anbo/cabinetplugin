import { TextEditorSelectionChangeEvent } from "vscode";
import { scrollToLineInPreview } from "../webviews/preview-panel";

export const cabinetCursorChangeListener = (e: TextEditorSelectionChangeEvent) => {
    // if the cursor is in a section, update the status bar with the section title
    if (e.selections.length > 0) {
        const uri = e.textEditor.document.uri.toString();
        console.log(uri)
        scrollToLineInPreview(e.selections[0].active.line, uri);
    }
};